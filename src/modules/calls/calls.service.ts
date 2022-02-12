import { Injectable } from '@nestjs/common';
import {
  Conference,
  ConferenceType,
  EventType,
  Participant,
  ParticipantState,
  QueryResponse, User, UserType, Visit, VisitStatus
} from 'api';
import SearchQuery from '../../databases/utils/search.query';
import CallsRepo from '../../databases/calls.repo';
import { ClientsSocketService } from '../socket/clients.socket.service';
import UsersRepo from '../../databases/users.repo';
import ServerConfigsRepo from '../../databases/server.configs.repo';
import VisitsRepo from '../../databases/visits.repo';
import { ObjectId } from '../../databases/utils';
import { smartDate } from 'javascript-dev-kit/';

@Injectable()
export class CallsService {
  constructor (private callsRepo: CallsRepo, private socketService: ClientsSocketService, private visitsRepo: VisitsRepo, private usersRepo: UsersRepo, private serverConfigsRepo: ServerConfigsRepo) {}

  public async query (query: SearchQuery<Conference, {userId: string, from, to}>): Promise<QueryResponse<Conference>> {
    const { skip, limit, sort, populations, projection, search, userId, from, to } = query;
    const condition = this.callsRepo.crud();

    if (search && search !== '') {
      condition.whereTextLike({ 'initiator.name': search }, 'or')
        .whereTextLike({ 'receiver.name': search }, 'or')
        .whereTextLike({ 'initiator.mobile': search }, 'or')
        .whereTextLike({ 'receiver.mobile': search }, 'or')
        .whereTextLike({ visitId: search }, 'or');
    }
    if (from && to) {
      condition.andWhere({ createdAt: { $gte: Number(from) } })
        .andWhere({ createdAt: { $lte: Number(to) } });
    }
    if (userId && userId !== '') {
      condition.orWhere({ 'initiator.id': userId })
        .orWhere({ 'receiver.id': userId });
    }
    return condition
      .skip(skip)
      .limit(limit)
      .project(projection || { events: 0 })
      .sort(sort || { createdAt: -1 })
      .query();
  }

  public async hangUpCall (id: string) {
    const conference = await this.callsRepo.crud().where({ id }).project({ id: 1, initiator: 1, receiver: 1 }).findOne();
    if (conference) {
      await this.callsRepo.crud().where({ id }).set({ state: 'ended', endedAt: smartDate().toISOString() }).updateOne();
      this.socketService.sendEvent(conference.initiator.id, EventType.EVENT_CALL_ENDED, conference.id);
      this.socketService.sendEvent(conference.receiver.id, EventType.EVENT_CALL_ENDED, conference.id);
    }
  }

  public async declineCall (id: string, reason?: string) {
    const conference = await this.callsRepo.crud().where({ id }).project({ id: 1, initiator: 1, receiver: 1 }).findOne();
    if (conference) {
      await this.callsRepo.crud().where({ id }).set({ state: 'ended', endedAt: smartDate().toISOString() }).updateOne();
      await this.socketService.sendEvent(conference.initiator.id, EventType.EVENT_CALL_DECLINED, conference.id);
      await this.socketService.sendEvent(conference.initiator.id, EventType.EVENT_CALL_DECLINED, { id: conference.id, reason });
    }
  }

  public async acceptCall (id: string, deviceInfo: any) {
    const conference = await this.callsRepo.crud().where({ id, state: 'initiating' }).project({ events: 0 }).findOne();
    if (conference) {
      await this.callsRepo.crud().where({ id }).set({ state: 'transmitting', 'receiver.deviceInfo': deviceInfo }).updateOne();
      await this.socketService.sendEvent(conference.initiator.id, EventType.EVENT_CALL_ACCEPTED, conference);
      return true;
    }
    return false;
  }

  public async initiateCall (initiatorId: string, type: ConferenceType, deviceInfo: any): Promise<Conference> {
    const requesterUser = await this.usersRepo.crud().withId(initiatorId).project({ type: 1, name: 1, _id: 1, mobile: 1 }).findOne();
    const serverConfigs = await this.serverConfigsRepo.getConfigs();
    if (type !== ConferenceType.video_audio) {
      serverConfigs.mediaConstraints.video = false;
    }
    const initiator: Participant = {
      id: String(requesterUser._id),
      name: requesterUser.name,
      state: ParticipantState.connecting,
      userType: requesterUser.type,
      mobile: requesterUser.mobile,
      deviceInfo
    };

    let visit: Visit;
    let receiverUser: User;
    if (requesterUser.type === UserType.DOCTOR) {
      visit = await this.visitsRepo.crud().where({ doctor: ObjectId(initiator.id), state: VisitStatus.STARTED })
        .project({ _id: 1, patient: 1, doctor: 1 })
        .findOne();
      if (!visit) {
        return undefined;
      }
      receiverUser = await this.usersRepo.crud().withId(String(visit.patient)).project({ type: 1, name: 1, _id: 1, mobile: 1 }).findOne();
    } else {
      visit = await this.visitsRepo.crud().where({ patient: ObjectId(initiator.id), state: VisitStatus.STARTED }).project({ _id: 1, patient: 1, doctor: 1 }).findOne();
      if (!visit) {
        return undefined;
      }
      receiverUser = await this.usersRepo.crud().withId(String(visit.doctor)).project({ type: 1, name: 1, _id: 1, mobile: 1 }).findOne();
    }

    const receiver: Partial<Participant> = {
      id: String(receiverUser._id),
      name: receiverUser.name,
      state: ParticipantState.connecting,
      userType: receiverUser.type,
      mobile: receiverUser.mobile
    };

    let session = new Conference(String(visit._id), process.env.PUBLIC_URL, type, undefined, serverConfigs, initiator, receiver as any);
    session.state = 'initiating';
    session = await this.socketService.signalCall(session);
    if (!session) {
      return session;
    }
    return this.callsRepo.crud().create(session);
  }
}

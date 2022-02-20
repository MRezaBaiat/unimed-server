import { Injectable } from '@nestjs/common';
import {
  Chat,
  Conference,
  DoctorStatus,
  EventType,
  PatientStatus,
  UserType
} from 'api';
import { LockService } from '../lock/lock.service';
import { AuthService } from '../auth/auth.service';
import UsersRepo from '../../databases/users.repo';
import { createUserRoomId } from './index';
import VisitsRepo from '../../databases/visits.repo';

@Injectable()
export class ClientsSocketService {
  constructor (private lockService: LockService, private visitsRepo: VisitsRepo, private authService: AuthService, private usersRepo: UsersRepo) {}

  public async deleteSession (userId: string) {
    const sockets = await global.io().sockets.in(createUserRoomId(userId)).fetchSockets();
    sockets.forEach(s => s.disconnect());
  }

  public async sendMessage (userId: string, senderId: string, roomId: string | null, object: Chat) {
    global.io().in(createUserRoomId(userId)).emit('message', senderId, roomId, object);
  }

  public sendStatus (...userIds: string[]) {
    userIds.forEach(async (userId: string) => {
      if (!await this.isOnline(userId)) {
        console.log('not online to send status', userId);
        return;
      }
      const user = await this.usersRepo.crud().withId(userId).project({ type: 1, ready: 1 }).findOne();
      const visit = await this.visitsRepo.findActiveVisit(userId);
      if (visit) {
        // visit.conference = await Conferences.getByVisitId(visit._id);
      }
      // const reservations = await this.reservationsRepo.findUserReservations(userId);
      if (user.type === UserType.PATIENT) {
        const status: PatientStatus = {
          visit: visit || await this.visitsRepo.findPatienceQueue(userId)
        };
        this.sendEvent(userId, EventType.EVENT_STATUS_UPDATE, status);
      } else {
        const status: DoctorStatus = {
          visit,
          ready: user.ready,
          queueList: await this.visitsRepo.getDoctorQueueList(userId)
        };
        this.sendEvent(userId, EventType.EVENT_STATUS_UPDATE, status);
      }
    });
  }

  public async isOnline (userId: string) {
    const map = global.io().of('/').adapter.rooms.get(createUserRoomId(userId));
    return map ? map.size > 0 : false;
  }

  public async getStatuses (ids: string[]): Promise<{_id: string, isOnline: boolean}[]> {
    const statuses: {_id: string, isOnline: boolean}[] = [];
    for (const id of ids) {
      statuses.push({
        _id: id,
        isOnline: await this.isOnline(id)
      });
    }
    return statuses;
  }

  public sendEvent (userId: string, eventName: string, data: any, roomId?: string) {
    global.io().in(createUserRoomId(userId)).emit(eventName, roomId, data);
  }

  public async sendFinalizableVisits (userId: string) {
    if (!await this.isOnline(userId)) {
      return;
    }
    const finalizableVisits = await this.visitsRepo.findUserFinalizationsList(userId);
    this.sendEvent(userId, 'finalizableVisits', finalizableVisits);
  }

  public async signalCall (offer: Conference) {
    if (!await this.isOnline(offer.receiver.id) || !await this.isOnline(offer.initiator.id)) {
      console.log('both of clients need to be online');
      return undefined;
    }
    // offer.videoCallVersion = Math.min(receiver.config.videoCallVersion, sender.config.videoCallVersion);
    offer.videoCallVersion = '2';
    console.log('call from ' + offer.initiator.id + ' to ' + offer.receiver.id);
    setImmediate(() => {
      this.sendEvent(offer.receiver.id, EventType.EVENT_CALL_REQUEST, offer);
    });
    return offer;
  }
}

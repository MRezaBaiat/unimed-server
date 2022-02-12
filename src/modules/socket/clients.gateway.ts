import {
  BaseWsExceptionFilter,
  ConnectedSocket, MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit, SubscribeMessage,
  WebSocketGateway, WsException
} from '@nestjs/websockets/';
import { createUserRoomId } from './index';
import { Server, Socket } from 'socket.io';
import { AbstractCallMetric, Chat, Conference, EventType, UserType, VisitStatus } from 'api/';
import { ClientsSocketService } from './clients.socket.service';
import { AuthService } from '../auth/auth.service';
import UsersRepo from '../../databases/users.repo';
import { Injectable, Catch, ExecutionContext, UseFilters } from '@nestjs/common/';
import { VisitsService } from '../visits/visits.service';
import UserId from '../../decorators/userid.decorator';
import VisitsRepo from '../../databases/visits.repo';
import CallsRepo from '../../databases/calls.repo';
import { smartDate } from 'javascript-dev-kit/';

declare global{
    function io(): Server;
}

declare module 'socket.io'{
    class Socket {
        userProps: {
            userid: string,
            os: string,
            type: UserType,
            mobile: string,
            videoCallVersion: number
        }
    }
}

@Catch(Error, WsException)
class WebsocketsExceptionFilter extends BaseWsExceptionFilter {
  catch (exception: WsException, ctx: ExecutionContext) {
    console.log(exception.message);
    console.log(exception);
  }
}

@UseFilters(new WebsocketsExceptionFilter())
@Injectable()
@WebSocketGateway(7070, { path: '/live', transports: ['websocket'], namespace: '/', allowEIO3: true })
export default class ClientsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor (private socketService: ClientsSocketService, private callsRepo: CallsRepo, private visitsRepo: VisitsRepo, private authService: AuthService, private usersRepo: UsersRepo, private visitsService: VisitsService) {}

  afterInit ({ server }): any {
    if (global.io) {
      throw new Error('socket service instantiated twice');
    }
    global.io = () => server;
  }

  handleDisconnect (socket: Socket) {
    if (socket.userProps) {
      socket.leave(createUserRoomId(socket.userProps.userid));
    }
  }

  async handleConnection (socket: Socket, ...args: any[]) {
    try {
      console.log('new socket connection');
      const token = socket.handshake.query.authorization as string;
      const videoCallVersion = Number(socket.handshake.query.videoCallVersion || 1);
      const res: any = await this.authService.decode(token);
      if (!res || !res.userid) {
        console.log('auth error 1');
        return socket.disconnect(true);
      }
      console.log('socket userid ', res.userid);
      const user = await this.usersRepo.crud().withId(res.userid).project({ _id: 1, type: 1, os: 1, mobile: 1 }).findOne();
      if (!user) {
        console.log('auth error 2');
        return socket.disconnect(true);
      }

      socket.userProps = {
        userid: String(user._id),
        os: user.os,
        type: user.type,
        mobile: user.mobile,
        videoCallVersion: videoCallVersion
      };

      socket.join(createUserRoomId(socket.userProps.userid));
      console.log('1');
      this.socketService.sendStatus(user._id);
      console.log('2');
      let activeVisit = await this.visitsRepo.findActiveVisit(user._id);
      console.log('3');
      if (activeVisit) {
        console.log('4');
        activeVisit = await this.visitsRepo.crud().withId(activeVisit._id).project({ conversations: 1, _id: 1 }).findOne();
        this.socketService.sendEvent(user._id, 'conversations', activeVisit.conversations.map(c => c.chat), activeVisit._id);
      } else {
        console.log('5');
        const queueVisit = await this.visitsRepo.findPatienceQueue(user._id);
        if (queueVisit) {
          console.log('6');
          this.visitsService.notifyQueues(String(queueVisit.doctor._id));
        }
      }
      console.log('7');
      await this.socketService.sendFinalizableVisits(user._id);

      socket.emit('authenticated');
    } catch (e) {
      console.log(e);
      socket.disconnect(true);
    }
  }

    @SubscribeMessage(EventType.REQUEST_VISIT)
  async handleRequestVisit (@ConnectedSocket() client: Socket, @MessageBody() packet: { doctorCode, discountCode }, @UserId() userId) {
    this.visitsService.visitRequested(userId, packet.doctorCode, packet.discountCode);
  }

    @SubscribeMessage(EventType.REQUEST_END_VISIT)
    async handleEndVisit (@ConnectedSocket() client: Socket, @MessageBody() visitId: string, @UserId() userId) {
      this.visitsService.endVisit(visitId, false);
    }

    @SubscribeMessage(EventType.VISIT_REQUEST_ACCEPTED)
    async handleAcceptVisit (@ConnectedSocket() client: Socket, @MessageBody() visitId: string, @UserId() userId) {
      this.visitsService.acceptVisit(visitId, userId);
    }

    @SubscribeMessage('typing_status')
    async handleTypingStatus (@ConnectedSocket() client: Socket, @MessageBody() packet: { visitId, status }, @UserId() userId) {
      const visit = await this.visitsRepo.crud().withId(packet.visitId)
        .where({ state: VisitStatus.STARTED })
        .project({ patient: 1, doctor: 1 })
        .findOne();
      if (!visit) {
        return;
      }

      if (userId !== String(visit.patient)) {
        this.socketService.sendEvent(String(visit.patient), 'typing_status', packet, packet.visitId);
      }
      if (userId !== String(visit.doctor)) {
        this.socketService.sendEvent(String(visit.doctor), 'typing_status', packet, packet.visitId);
      }
    }

    @SubscribeMessage('message')
    async handleMessage (@ConnectedSocket() client: Socket, @MessageBody() packet: [string, Chat], @UserId() userId) {
      const roomId = packet[0];
      const chat = packet[1];
      delete chat.sendStatus;
      chat.createdAt = smartDate().toISOString();
      this.visitsService.sendMessage(userId, roomId, chat, client.userProps.type);
    }

  @SubscribeMessage(EventType.EVENT_CALL_ACCEPTED)
    async handleAcceptCall (@ConnectedSocket() client: Socket, @MessageBody() packet: Conference, @UserId() userId) {
      this.socketService.sendEvent(packet.initiator.id, EventType.EVENT_CALL_ACCEPTED, packet);
    }

  @SubscribeMessage(EventType.EVENT_CALL_DECLINED)
  async handleDeclineCall (@ConnectedSocket() client: Socket, @MessageBody() packet, @UserId() userId) {
    this.socketService.sendEvent(packet.initiator.id, EventType.EVENT_CALL_DECLINED, packet);
  }

  @SubscribeMessage('call-analytics')
  async handleCallAnalytics (@ConnectedSocket() client: Socket, @MessageBody() packet: AbstractCallMetric<any>, @UserId() userId) {
    packet.userId = userId;
    this.callsRepo.addCallMetric(packet);
    return true;
  }

  @SubscribeMessage('exchange-sdp')
  async handleExchangeSDP (@ConnectedSocket() client: Socket, @MessageBody() packet, @UserId() userId) {
    const { to } = packet;
    packet.from = userId;
    this.socketService.sendEvent(to, 'exchange-sdp', packet);
    return true;
  }

  @SubscribeMessage('set-language')
  async handleSetLanguage (@ConnectedSocket() client: Socket, @MessageBody() packet, @UserId() userId) {

  }

  @SubscribeMessage('ping_client')
  async handlePingClient (@ConnectedSocket() client: Socket, @MessageBody() targetId: string, @UserId() userId) {
    return this.socketService.isOnline(targetId);
  }
}

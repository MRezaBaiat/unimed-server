import { Injectable } from '@nestjs/common';
import UsersRepo from '../../databases/users.repo';
import { UserType } from 'api';
import { ClientsSocketService } from '../socket/clients.socket.service';
import EventsService from '../notifications/events.service';
import PushNotificationService from '../notifications/push.notification.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GatewayService } from '../gateway/gateway.service';
import { DoctorComingOnlineNotification } from '../notifications/notifications';

@Injectable()
export class TimerService {
  constructor (private usersRepo: UsersRepo, private gatewayService: GatewayService, private socketService: ClientsSocketService, private eventsService: EventsService, private notificationsService: PushNotificationService) {}
  private autoModified: string[] = [];
  private lastNotified: {[key: string]: number}[] = [];

    @Cron(CronExpression.EVERY_30_SECONDS)
  public checkGateways () {
    this.gatewayService.checkUnverifiedTransactions().then((res) => {
      // console.log(res);
    });
  }

    @Cron('0 */2 * * * *')
    public async checkWorkTimes () {
      const doctors = await this.usersRepo.crud().where({ type: UserType.DOCTOR }).project({ _id: 1, name: 1, mobile: 1, code: 1, ready: 1, 'details.responseDays': 1, notificationQueuePatients: 1 }).findMany();

      for (const doctor of doctors) {
        try {
          const isWorkingTime = (await this.usersRepo.getDoctorCurrentResponseTime(doctor._id)) !== undefined;

          if (isWorkingTime) {
            if (this.autoModified.indexOf(doctor._id) < 0) {
              this.autoModified.push(doctor._id);
            }
            if (!doctor.ready) {
              console.log('auto started doctor ' + doctor._id);
              await this.usersRepo.setReadyState(doctor._id, true);
              await this.socketService.sendStatus(doctor._id);
              this.eventsService.notifyWorkTimeStarted(doctor._id);
            }
          } else {
            if (this.autoModified.indexOf(doctor._id) !== -1) {
              this.autoModified.splice(this.autoModified.indexOf(doctor._id), 1);
            }
            if (doctor.ready) {
              console.log('auto ended doctor ' + doctor._id);
              await this.usersRepo.setReadyState(doctor._id, false);
              await this.socketService.sendStatus(doctor._id);
              this.eventsService.notifyWorkTimeEnded(doctor._id);
            }

            const responseTime = await this.usersRepo.getDoctorCurrentResponseTime(doctor._id, 10 * 60 * 1000); // 10min

            if (responseTime) {
              if (!this.lastNotified[doctor._id] || Date.now() - this.lastNotified[doctor._id] > 30 * 60 * 1000) { // 30 min
                this.lastNotified[doctor._id] = Date.now();
                this.eventsService.notifyWorkTimeClose(doctor._id);
              }
            }

            const notificationQueuePatients = doctor.notificationQueuePatients;
            if (notificationQueuePatients && notificationQueuePatients.length !== 0) {
              const responseTime = await this.usersRepo.getDoctorCurrentResponseTime(doctor._id, 1 * 60 * 60 * 1000); // 1hour
              if (responseTime) {
                // @ts-ignore
                const minutes = Math.round(responseTime.diff / 1000 / 60);
                notificationQueuePatients.forEach((patientId) => {
                  this.notificationsService.sendNotification(patientId, new DoctorComingOnlineNotification(doctor.name, minutes));
                  this.usersRepo.removePatientOfNotificationQueue(doctor._id, patientId);
                });
              }
            }
          }
        } catch (e) {
          console.log(e);
        }
      }
      console.log('timer check finished');
    }
}

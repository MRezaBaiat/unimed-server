import { Injectable } from '@nestjs/common';
import PushNotificationService, { NOTIFICATION_TYPES } from './push.notification.service';
import SmsService from './sms.service';
import { UsersService } from '../users/users.service';
import UsersRepo from '../../databases/users.repo';

@Injectable()
export default class EventsService {
  constructor (private usersService: UsersService, private usersRepo: UsersRepo, private pushService: PushNotificationService, private smsService: SmsService) {}

  public async notifyNewPatient (doctorId: string) {
    const settings = await this.usersService.getNotificationSettings(doctorId);
    if (settings.newPatient.notification) {
      console.log('notifyNewPatient().notification');
      this.pushService.sendNotification(doctorId, NOTIFICATION_TYPES.NEW_PATIENT);
    }
    if (settings.newPatient.sms) {
      console.log('notifyNewPatient().sms');
      const user = await this.usersRepo.crud().withId(doctorId).project({ mobile: 1 }).findOne();
      this.smsService.sendDirect(user.mobile, NOTIFICATION_TYPES.NEW_PATIENT.title);
    }
  }

  public async notifyWorkTimeStarted (doctorId: string) {
    const settings = await this.usersService.getNotificationSettings(doctorId);
    if (settings.workTimeStarted.notification) {
      console.log('notifyWorkTimeStarted().notification');
      this.pushService.sendNotification(doctorId, NOTIFICATION_TYPES.RESPONSE_TIME_STARTED);
    }
    if (settings.workTimeStarted.sms) {
      console.log('notifyWorkTimeStarted().sms');
      const user = await this.usersRepo.crud().withId(doctorId).project({ mobile: 1 }).findOne();
      console.log(user.mobile);
      this.smsService.sendDirect(user.mobile, NOTIFICATION_TYPES.RESPONSE_TIME_STARTED.title);
    }
  }

  public async notifyWorkTimeClose (doctorId: string) {
    const settings = await this.usersService.getNotificationSettings(doctorId);
    if (settings.workTimeClose.notification) {
      console.log('notifyWorkTimeClose().notification');
      this.pushService.sendNotification(doctorId, NOTIFICATION_TYPES.WORK_TIME_CLOSE);
    }
    if (settings.workTimeClose.sms) {
      console.log('notifyWorkTimeClose().sms');
      const user = await this.usersRepo.crud().withId(doctorId).project({ mobile: 1, code: 1 }).findOne();
      this.smsService.sendSms(user.mobile, String(user.code), 'worktime');
    }
  }

  public async notifyWorkTimeEnded (doctorId: string) {
    const settings = await this.usersService.getNotificationSettings(doctorId);
    if (settings.workTimeEnded.notification) {
      console.log('notifyWorkTimeEnded().notification');
      this.pushService.sendNotification(doctorId, NOTIFICATION_TYPES.RESPONSE_TIME_ENDED);
    }
    if (settings.workTimeEnded.sms) {
      console.log('notifyWorkTimeEnded().sms');
      const user = await this.usersRepo.crud().withId(doctorId).project({ mobile: 1 }).findOne();
      this.smsService.sendDirect(user.mobile, NOTIFICATION_TYPES.RESPONSE_TIME_ENDED.title);
    }
  }

  public async notifyPatientOfNewReservation (patientMobile: string, patientName: string) {
    this.smsService.sendSms(patientMobile, patientName, 'new-reservation-target-patient');
  }

  public async notifyDoctorOfNewReservation (doctorMobile: string, doctorName: string) {
    this.smsService.sendSms(doctorMobile, doctorName, 'new-reservation-target-doctor');
  }
}

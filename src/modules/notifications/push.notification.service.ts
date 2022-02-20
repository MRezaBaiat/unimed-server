import { Injectable } from '@nestjs/common';
import NotificationsRepo from '../../databases/notifications.repo';
import admin from 'firebase-admin';
import serviceAccount from './google-services.json';
import { Notification, QueryResponse } from 'api';
import { addWhiteListFilter } from '../../databases/utils';
import UsersRepo from '../../databases/users.repo';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any),
  databaseURL: 'https://unimed.firebaseio.com'
});

interface NotificationProps{
    title: string,
    body?: string,
    soundName: 'default' | 'voice_mode_1.mp3' | 'voice_mode_2.mp3' | 'voice_visit_time_ended.mp3',
    channelId: 'default' | 'visit-started' | 'visit-time-ended' | 'patient-in-queue',
    link?: string,
    ignoreInForeground: boolean
}

export const NOTIFICATION_TYPES = {
  FREE_TEXT_FNC: (title: string, body: string, link: string): NotificationProps => {
    return {
      channelId: 'default',
      soundName: 'default',
      title: title,
      link: link,
      body: body,
      ignoreInForeground: false
    };
  },
  NEW_PATIENT: {
    title: 'یک بیمار جدید در صف انتظار است',
    channelId: 'patient-in-queue',
    soundName: 'voice_mode_2.mp3',
    ignoreInForeground: false
  } as NotificationProps,
  VISIT_STARTED: {
    title: 'ویزیت شما شروع شد',
    channelId: 'visit-started',
    soundName: 'voice_mode_1.mp3',
    ignoreInForeground: false
  } as NotificationProps,
  RESPONSE_TIME_STARTED: {
    title: 'وضعیت شما به حالت فعال تغییر کرد',
    channelId: 'default',
    soundName: 'default',
    ignoreInForeground: false
  } as NotificationProps,
  RESPONSE_TIME_ENDED: {
    title: 'وضعیت شما به حالت غیر فعال تغییر کرد',
    channelId: 'default',
    soundName: 'default',
    ignoreInForeground: false
  } as NotificationProps,
  WORK_TIME_CLOSE: {
    title: 'با سلام، ساعت کار مطپ شما نزدیک است',
    channelId: 'default',
    soundName: 'default',
    ignoreInForeground: false
  } as NotificationProps,
  DOCTOR_RETURNED_PAYMENT: (doctorName: string): NotificationProps => {
    return {
      title: `هزینه ویزیت شما توسط ${doctorName} بازگشت داده شد`,
      channelId: 'default',
      soundName: 'default',
      ignoreInForeground: false
    };
  }
};

@Injectable()
export default class PushNotificationService {
  constructor (private notificationsRepo: NotificationsRepo, private usersRepo: UsersRepo) {}
  public async sendNotification (userId: string, notification: NotificationProps, priority = 'high') {
    const user = await this.usersRepo.crud().withId(userId)
      .project({ fcmtoken: 1 })
      .findOne();
    if (!user || !user.fcmtoken) {
      console.log('push notification', 'user not found ' + userId + ' , or he did not have a fcm token set');
      return;
    }
    console.log('push notification', 'sending push');
    admin.messaging().sendToDevice([user.fcmtoken], this.generatePayload(notification), {
      contentAvailable: true,
      priority
    })
      .then((response) => {
        console.log('Successfully sent message:', response);
      })
      .catch((error) => {
        console.log('Error sending message:', error);
      });
  }

  public async query (skip: number, limit: number, search: string, whiteList?: string[]): Promise<QueryResponse<Notification>> {
    const condition = this.notificationsRepo.crud();
    whiteList && addWhiteListFilter(condition, whiteList);
    return condition
      .project({ __v: 0 })
      .populate(['sender'])
      .skip(skip)
      .limit(limit)
      .query();
  };

  public async sendToAll (title: string, body: string, link: string, adminId: string) {
    const id = (await this.notificationsRepo.crud().create({
      title,
      body,
      link,
      date: Date.now(),
      state: 'SENDING',
      sender: adminId,
      successCount: 0
    }))._id;
    const notification = NOTIFICATION_TYPES.FREE_TEXT_FNC(title, body, link);
    admin.messaging().sendToTopic('all-devices', this.generatePayload(notification), {
      contentAvailable: true,
      priority: 'high'
    }).then((response: any) => {
      console.log('Success count : ' + response.successCount);
      this.notificationsRepo.crud().withId(id)
        .set({ state: 'DONE', successCount: response.successCount || 0 })
        .updateOne();
      return {
        successCount: response.successCount || 0
      };
    }).catch((error) => {
      console.log('Error sending message:', error);
      this.notificationsRepo.crud().withId(id)
        .set({ state: 'FAILED' })
        .updateOne();
      return {
        successCount: 0
      };
    });
  };

  private generatePayload (notification: NotificationProps): admin.messaging.MessagingPayload {
    return {
      notification: {
        android_channel_id: notification.channelId,
        title: notification.title,
        body: notification.body || '',
        tag: 'Unimed',
        sound: notification.soundName,
        badge: '0'
      },
      data: {
        notification: JSON.stringify({
          title: notification.title,
          message: notification.body || '',
          channelId: notification.channelId,
          link: notification.link,
          soundName: notification.soundName,
          ignoreInForeground: notification.ignoreInForeground,
          playSound: true,
          vibrate: true,
          priority: 'max',
          invokeApp: true,
          tag: 'Unimed',
          badge: 0,
          playOnForeground: true // TODO remove this in favour of ignoreInForeground
        })
      }
    };
  };
}

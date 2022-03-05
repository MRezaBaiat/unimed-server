import { Injectable } from '@nestjs/common';
import NotificationsRepo from '../../databases/notifications.repo';
import admin from 'firebase-admin';
import serviceAccount from './google-services.json';
import { Notification, QueryResponse } from 'api';
import { addWhiteListFilter } from '../../databases/utils';
import UsersRepo from '../../databases/users.repo';
import { AbstractNotification, GeneralNotification } from './notifications';
import { findLanguageFromMobile } from '../../utils';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any),
  databaseURL: 'https://unimed.firebaseio.com'
});

@Injectable()
export default class PushNotificationService {
  constructor (private notificationsRepo: NotificationsRepo, private usersRepo: UsersRepo) {}
  public async sendNotification (userId: string, notification: AbstractNotification, priority = 'high') {
    const user = await this.usersRepo.crud().withId(userId)
      .project({ fcmtoken: 1, mobile: 1 })
      .findOne();
    if (!user || !user.fcmtoken) {
      console.log('push notification', 'user not found ' + userId + ' , or he did not have a fcm token set');
      return;
    }
    console.log('push notification', 'sending push');
    admin.messaging().sendToDevice([user.fcmtoken], this.generatePayload(notification, findLanguageFromMobile(user.mobile)), {
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
    const notification = new GeneralNotification(title, body, link);
    admin.messaging().sendToTopic('all-devices', this.generatePayload(notification, 'fa'), {
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

  private generatePayload (notification: AbstractNotification, language: 'fa' | 'az'): admin.messaging.MessagingPayload {
    const props = notification.getNotificationProps(language);
    return {
      notification: {
        android_channel_id: props.channelId,
        title: props.title,
        body: props.body || '',
        tag: 'Unimed',
        sound: props.soundName,
        badge: '0'
      },
      data: {
        notification: JSON.stringify({
          title: props.title,
          message: props.body || '',
          channelId: props.channelId,
          link: props.link,
          soundName: props.soundName,
          ignoreInForeground: props.ignoreInForeground,
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

import { Global, Module } from '@nestjs/common';
import SmsService from './sms.service';
import PushNotificationService from './push.notification.service';
import EventsService from './events.service';
import NotificationsAdminController from './notifications.admin.controller';
import { UsersModule } from '../users/users.module';

@Global()
@Module({
  imports: [UsersModule],
  controllers: [NotificationsAdminController],
  providers: [SmsService, PushNotificationService, EventsService],
  exports: [SmsService, PushNotificationService, EventsService]
})
export class NotificationsModule {}

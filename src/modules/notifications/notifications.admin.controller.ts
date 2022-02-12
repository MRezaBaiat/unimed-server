import { Controller, UseGuards, Post, Body, Get, Query } from '@nestjs/common/';
import { AdminJwtAuthGuard } from '../../guards/admin.jwt.auth.guard';
import NotificationCreateDto from './dto/notification.create.dto';
import PushNotificationService from './push.notification.service';
import UserId from '../../decorators/userid.decorator';
import NotificationsRepo from '../../databases/notifications.repo';
import WhiteList from '../../decorators/whitelist.decorator';

@UseGuards(AdminJwtAuthGuard)
@Controller('admin/notifications')
export default class NotificationsAdminController {
  constructor (private pushNotificationsService: PushNotificationService, private notificationsRepo: NotificationsRepo) {}

  @Post('/')
  public handleCreateNotification (@Body() body: NotificationCreateDto, @UserId() userId) {
    return this.pushNotificationsService.sendToAll(body.title, body.body, body.link, userId);
  }

  @Get('/')
  public handleGet (@Query('id') id) {
    return this.notificationsRepo.crud().withId(id).populate(['sender']).findOne();
  }

  @Get('/query')
  public handleQuery (@Query('search') search, @Query('skip') skip, @Query('limit') limit, @WhiteList('notifications') whiteList) {
    return this.pushNotificationsService.query(Number(skip), Number(limit), search, whiteList);
  }
}

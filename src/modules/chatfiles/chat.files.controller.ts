import { Controller, Headers, Post, Request, UseGuards } from '@nestjs/common';
import { FilesService } from '../files/files.service';
import { Chat, SendStatus } from 'api/';
import { JwtAuthGuard } from '../../guards/jwt.auth.guard';
import UserId from '../../decorators/userid.decorator';
import { VisitsService } from '../visits/visits.service';
import UsersRepo from '../../databases/users.repo';
import { smartDate } from 'javascript-dev-kit/';

@UseGuards(JwtAuthGuard)
@Controller('chatfiles')
export default class ChatFilesController {
  constructor (private filesService: FilesService, private usersRepo: UsersRepo, private visitsService: VisitsService) {}

  @Post('/')
  public async handlePostFile (@Request() request, @Headers() headers, @UserId() userId) {
    const { id, roomid, type } = headers;
    const filename = decodeURIComponent(headers.filename);
    const mediaInfo = JSON.parse(headers.mediainfo);
    const { url, length } = await this.filesService.upload(request, {
      ...mediaInfo,
      roomId: roomid,
      fileType: type
    });

    const chat: Chat = {
      sendStatus: SendStatus.SENT,
      text: '',
      id,
      sender: userId,
      type,
      url,
      fileSize: length,
      mediaInfo,
      createdAt: smartDate().toISOString(),
      fileName: filename
    };

    const user = await this.usersRepo.crud().withId(userId).project({ type: 1 }).findOne();
    this.visitsService.sendMessage(chat.sender, roomid, chat, user.type);
    return url;
  }
}

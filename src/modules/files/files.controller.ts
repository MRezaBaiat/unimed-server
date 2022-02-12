import { Controller, Get, Query, Request, Response, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt.auth.guard';
import { FilesService } from './files.service';
import fs from 'fs';
import { Chat, ChatType, VisitStatus } from 'api';
import path from 'path';
import VisitsRepo from '../../databases/visits.repo';
import FilesRepo from '../../databases/files.repo';
import { InjectConnection } from '@nestjs/mongoose/';
import { Connection } from 'mongoose';
import UsersRepo from '../../databases/users.repo';

const Url = require('url');

@Controller('files')
export class FilesController {
  constructor (private filesService: FilesService, private usersRepo: UsersRepo, private visitsRepo: VisitsRepo, private filesRepo: FilesRepo, @InjectConnection() private connection: Connection) {
    /* new Promise(async () => {
      let shouldRun = true;
      const per = 6000;
      let current = 0;
      while (shouldRun) {
        const visits = await this.visitsRepo.crud()
          .where({ state: VisitStatus.ENDED, conversations: { $exists: true, $not: { $size: 0 } } })
          .skip(current)
          .limit(current + per)
          .findMany();

        if (visits.length === 0) {
          shouldRun = false;
        }
        for (const visit of visits) {
          for (const conversation of visit.conversations) {
            if (conversation.chat.type === ChatType.TEXT) {
              continue;
            }
            await this.copyChatFile(conversation.chat, String(visit._id)).catch(console.log);
          }
        }

        current += per;
      }

      console.log('finished total ', current);
    }); */

    /* new Promise(async () => {
      let shouldRun = true;
      const per = 1000;
      let current = 0;
      while (shouldRun) {
        const users = await this.usersRepo.crud()
          .where({ imageUrl: { $ne: null } })
          .skip(current)
          .limit(current + per)
          .findMany();

        if (users.length === 0) {
          shouldRun = false;
        }
        for (const user of users) {
          await this.copyProfileImage(String(user._id), user.imageUrl).catch(console.log);
        }

        current += per;
      }

      console.log('finished total ', current);
    }); */
  }

  private async copyProfileImage (userId: string, url: string) {
    const basePath = '/mnt/matap-files/';
    const url_parts = Url.parse(decodeURIComponent(url), true);
    const query = url_parts.query.q;
    const filePath = basePath + query;
    if (!fs.existsSync(filePath)) {
      return; // console.log('file didnt exist', filePath);
    }
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) {
      return console.log('not a file!');
    }
    const filename = path.parse(filePath).name;
    const oldUrl = userId + ':::' + url;
    const exists = await this.filesRepo.crud().where({ oldUrl: oldUrl }).findOne();
    if (exists) {
      return console.log('already exists');
    }
    console.log('copying');
    const file = await this.filesService.copyFromStream(fs.createReadStream(filePath), filename, undefined, { fileType: ChatType.IMAGE }, oldUrl);
    console.log('copied ', file.url);
    await this.usersRepo.crud().withId(userId)
      .set({ imageUrl: file.url })
      .updateOne();
  }

  private async copyChatFile (chat: Chat, roomId: string) {
    const basePath = '/mnt/matap-files/';
    const url_parts = Url.parse(decodeURIComponent(chat.url), true);
    const query = url_parts.query.q;
    const filePath = basePath + query;
    if (!fs.existsSync(filePath)) {
      return; // console.log('file didnt exist', filePath);
    }
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) {
      return console.log('not a file!');
    }
    const filename = path.parse(filePath).name;
    const oldUrl = chat.url + ':::' + chat.id + ':::' + roomId;
    const exists = await this.filesRepo.crud().where({ oldUrl: oldUrl }).findOne();
    if (exists) {
      return console.log('already exists');
    }
    console.log('copying');
    const file = await this.filesService.copyFromStream(fs.createReadStream(filePath), filename, undefined, { ...chat.mediaInfo, roomId: roomId, fileType: chat.type }, oldUrl);
    console.log('copied ', file.url);
    await this.visitsRepo.crud().withId(roomId).where({ 'conversations.chat.id': chat.id })
      .set({ 'conversations.$.chat.url': file.url })
      .updateOne();

    console.log('fixed for visit', roomId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/chat')
  public async handleGetChatFile (@Request() request, @Response() response, @Query('id') id) {
    return this.filesService.download(id, request, response);
  }

  @Get('/')
  public handleGetFile (@Request() request, @Response() response, @Query('id') id) {
    return this.filesService.download(id, request, response);
  }
}

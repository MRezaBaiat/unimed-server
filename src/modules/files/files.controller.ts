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
  constructor (private filesService: FilesService, private usersRepo: UsersRepo, private visitsRepo: VisitsRepo, private filesRepo: FilesRepo, @InjectConnection() private connection: Connection) {}

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

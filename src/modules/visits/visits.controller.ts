import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt.auth.guard';
import UserId from '../../decorators/userid.decorator';
import VisitsRepo from '../../databases/visits.repo';
import { VisitsService } from './visits.service';
import { EventType, VisitStatus, Chat } from 'api/';
import { Socket } from 'socket.io';
import { ClientsSocketService } from '../socket/clients.socket.service';

@UseGuards(JwtAuthGuard)
@Controller('visits')
export class VisitsController {
  constructor (private visitsRepo: VisitsRepo, private visitsService: VisitsService, private socketService: ClientsSocketService) {}

  @Get('/history')
  public async handleGetHistory (@UserId() userId, @Query('target') target, @Query('skip') skip, @Query('limit') limit) {
    return this.visitsRepo.query({ skip: Number(skip), limit: Number(limit), userId: userId, targetId: target === 'undefined' ? undefined : target, filters: { visitStatus: VisitStatus.ENDED }, populations: ['patient', 'doctor', { path: 'doctor', populate: { path: 'specialization', model: 'specializations' } }] });
  }

  @Get('/conversations')
  public async handleGetConversations (@Query('id') id) {
    return this.visitsRepo.getConversationsHistory(id);
  }

  @Get('/initiate_visit')
  public async handleInitiateVisit (@UserId() userId, @Query('code') code) {
    return this.visitsService.checkVisitRequest(code, userId, 'fa');
  }
}

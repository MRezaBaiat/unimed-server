import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminJwtAuthGuard } from '../../guards/admin.jwt.auth.guard';
import CallsRepo from '../../databases/calls.repo';
import { CallsService } from './calls.service';

@UseGuards(AdminJwtAuthGuard)
@Controller('admin/calls')
export class CallsAdminController {
  constructor (private callsRepo: CallsRepo, private callsService: CallsService) {}

  @Get('/conference')
  public handleGet (@Query('conferenceId') conferenceId) {
    return this.callsRepo.crud().withId(conferenceId).findOne();
  }

  @Get('/query')
  public handleQuery (@Query('search') search, @Query('skip') skip, @Query('limit') limit, @Query('userId') userId, @Query('from') from, @Query('to') to) {
    return this.callsService.query({ skip: Number(skip), limit: Number(limit), search, userId, from: Number(from), to: Number(to) });
  }
}

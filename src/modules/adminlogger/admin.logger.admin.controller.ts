import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminJwtAuthGuard } from '../../guards/admin.jwt.auth.guard';
import { AdminLoggerService } from './admin.logger.service';
import WhiteList from '../../decorators/whitelist.decorator';

@UseGuards(AdminJwtAuthGuard)
@Controller('admin/adminlogs')
export class AdminLoggerAdminController {
  constructor (private adminLoggerService: AdminLoggerService) {}

  @Get('/query')
  public handleQuery (@Query('search')search, @Query('skip') skip, @Query('limit') limit, @WhiteList('adminLogs') whiteList) {
    return this.adminLoggerService.query({ skip: Number(skip), limit: Number(limit), search, whiteList });
  }
}

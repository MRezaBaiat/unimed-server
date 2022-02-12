import { Controller, UseGuards, Get, Query } from '@nestjs/common/';
import { AdminJwtAuthGuard } from '../../guards/admin.jwt.auth.guard';
import { CrashesService } from './crashes.service';
import WhiteList from '../../decorators/whitelist.decorator';

@UseGuards(AdminJwtAuthGuard)
@Controller('admin/crashes')
export default class CrashesAdminController {
  constructor (private crashesService: CrashesService) {}

  @Get('/query')
  public handleQuery (@Query('search') search, @Query('skip') skip, @Query('limit') limit) {
    return this.crashesService.query({ skip: Number(skip), limit: Number(limit), search, whiteList: undefined });
  }
}

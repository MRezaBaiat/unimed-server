import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import WhiteList from '../../decorators/whitelist.decorator';
import VisitsRepo from '../../databases/visits.repo';
import { AdminJwtAuthGuard } from '../../guards/admin.jwt.auth.guard';

@UseGuards(AdminJwtAuthGuard)
@Controller('admin/surveys')
export class SurveysAdminController {
  constructor (private visitsRepo: VisitsRepo) {}

  @Get('/query')
  public handleQuery (@Query('skip') skip, @Query('limit') limit, @Query('search') search, @Query('from') from, @Query('to') to, @WhiteList('users') allowedUsers, @WhiteList('visits') whiteList) {
    const notEmpty = (val) => val && val !== '' ? val : undefined;
    return this.visitsRepo.querySurveys({ limit, skip, search: notEmpty(search), dateRange: to && from ? { from: notEmpty(from), to: notEmpty(to) } : undefined, doctorsWhitelist: allowedUsers, whiteList: whiteList });
  }
}

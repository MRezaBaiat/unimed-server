import { Controller, UseGuards, Query, Get, Patch, Body } from '@nestjs/common/';

import { AdminJwtAuthGuard } from '../../guards/admin.jwt.auth.guard';
import { VisitsService } from './visits.service';
import WhiteList from '../../decorators/whitelist.decorator';
import { IdAccessGuard } from '../../guards/id.access.guard';
import VisitsRepo from '../../databases/visits.repo';

@UseGuards(AdminJwtAuthGuard)
@Controller('admin/visits')
export default class VisitsAdminController {
  constructor (private visitsService: VisitsService, private visitsRepo: VisitsRepo) {}

  @Get('/query')
  public async handleQuery (@Query() query, @WhiteList('users') allowedUsers, @WhiteList('visits') whiteList) {
    const skip = Number(query.skip);
    const limit = Number(query.limit);
    const { id, search, from, to, moneyReturned, visitStatus, discount } = query;
    const notEmpty = (val) => val && val !== '' ? val : undefined;
    return this.visitsRepo.query({ userId: id, skip, limit, search: notEmpty(search), dateRange: { from: notEmpty(from), to: notEmpty(to) }, doctorsWhiteList: allowedUsers, filters: { visitStatus: notEmpty(visitStatus), discount: notEmpty(discount), moneyReturned: notEmpty(moneyReturned), visitsWhiteList: whiteList } });
  }

  @UseGuards(IdAccessGuard('visits', r => r.query.id))
  @Get('/')
  public async handleGetVisit (@Query('id') id) {
    return this.visitsRepo.crud().withId(id)
      .project({ __v: 0, conversations: 0 })
      .populate(['doctor', 'patient']).findOne();
  }

  @UseGuards(IdAccessGuard('visits', r => r.body.id))
  @Patch('/return_payment')
  public async handleReturnPayment (@Body() body) {
    return this.visitsService.returnPaidAmount(body.id);
  }

  @UseGuards(IdAccessGuard('visits', r => r.body.id))
  @Patch('/end')
  public async handleEndVisit (@Body() body) {
    const { id, returnMoney } = body;
    return this.visitsService.endVisit(id, returnMoney);
  }
}

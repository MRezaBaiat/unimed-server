import { Controller, UseGuards, Query, Get, Patch, Body, Post } from '@nestjs/common';
import { AdminJwtAuthGuard } from '../../guards/admin.jwt.auth.guard';
import { TransactionsService } from './transactions.service';
import TransactionCreateDto from './dto/transaction.create.dto';
import UserId from '../../decorators/userid.decorator';
import AdminsRepo from '../../databases/admins.repo';
import UsersRepo from '../../databases/users.repo';
import BadRequestError from '../../errors/badrequest-error';
import { IdAccessGuard } from '../../guards/id.access.guard';
import WhiteList from '../../decorators/whitelist.decorator';
import TransactionsRepo from '../../databases/transactions.repo';
import { GatewayService } from '../gateway/gateway.service';

@UseGuards(AdminJwtAuthGuard)
@Controller('admin/transactions')
export default class TransactionsAdminController {
  constructor (private transactionsService: TransactionsService, private gatewayService: GatewayService, private transactionsRepo: TransactionsRepo, private usersRepo: UsersRepo, private adminsRepo: AdminsRepo) {}

  @Post('/')
  public async handleCreateTransaction (@Body() body: TransactionCreateDto, @Query('id') id, @UserId() userId) {
    const admin = await this.adminsRepo.crud().withId(userId).project({ _id: 1, name: 1 }).findOne();
    const user = await this.usersRepo.crud().withId(id).project({ _id: 1, name: 1 }).findOne();
    if (!admin || !user) {
      throw new BadRequestError();
    }
    return await this.transactionsService.create({
      ...body,
      issuer: {
        type: 'admin',
        _id: String(admin._id),
        name: admin.name
      },
      target: {
        _id: String(user._id),
        name: user.name || 'user' + String(user._id)
      }
    } as any);
  }

  @UseGuards(IdAccessGuard('transactions', r => r.query.id))
  @Get('/audit')
  public async handleGetAudit (@Query('id') id, @Query('type') type, @Query('fromDate') fromDate, @Query('toDate') toDate) {
    return this.transactionsService.calculateFinancialAudit(id, type, fromDate, toDate);
  }

  @Get('/query')
  public handleQuery (@Query('id') id, @Query('type') type, @Query('search') search, @Query('skip') skip, @Query('limit') limit, @Query('fromDate') fromDate, @Query('toDate') toDate, @WhiteList('transactions') whiteList) {
    return this.transactionsRepo.query(id, type, Number(fromDate), Number(toDate), Number(skip), Number(limit), undefined, search, whiteList);
  }

  @Get('/report/query')
  public handleQueryReports (@Query('type') type, @Query('search') search, @Query('skip') skip, @Query('limit') limit, @Query('fromDate') fromDate, @Query('toDate') toDate, @WhiteList('transactions') whiteList) {
    return this.transactionsService.queryReports(type, fromDate, toDate, skip, limit, search, whiteList);
  }

  @UseGuards(IdAccessGuard('transactions', r => r.query.id))
  @Get('/')
  public handleGetTransaction (@Query('id') id) {
    return this.transactionsRepo.crud().withId(id)
      .populate(['healthCenter'])
      .findOne();
  }

  @Get('/accounting/query')
  public handleQueryAccounting (@Query() query, @WhiteList('transactions') whiteList) {
    const { search, type } = query;
    const fromDate = Number(query.fromDate);
    const toDate = Number(query.toDate);
    const skip = Number(query.skip);
    const limit = Number(query.limit);
    return this.transactionsService.queryAllAccountings(type, fromDate, toDate, skip, limit, search, whiteList);
  }

  @Post('/settle')
  public handleSettle (@Body() body, @UserId() userId) {
    const { visitIds, amount, details, trackingCode, type, targetId } = body;
    return this.transactionsService.applySettlement(userId, targetId, visitIds, type, amount, details, trackingCode);
  }

  @Get('/verify-transactions')
  public handleVerifyTransactions () {
    return this.gatewayService.checkUnverifiedTransactions();
  }
}

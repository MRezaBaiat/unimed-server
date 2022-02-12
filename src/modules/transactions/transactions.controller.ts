import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt.auth.guard';
import UserId from '../../decorators/userid.decorator';
import { TransactionsService } from './transactions.service';
import TransactionsRepo from '../../databases/transactions.repo';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export default class TransactionsController {
  constructor (private transactionsRepo: TransactionsRepo) {}

  @Get('/')
  public handleQueryTransactions (@Query('skip') skip, @Query('limit') limit, @UserId() userId) {
    return this.transactionsRepo.query(userId, 'user', undefined, undefined, skip, limit, undefined, undefined);
  }
}

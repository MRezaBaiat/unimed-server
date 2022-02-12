import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import TransactionsAdminController from './transactions.admin.controller';
import { GatewayService } from '../gateway/gateway.service';
import TransactionsController from './transactions.controller';

@Module({
  imports: [],
  controllers: [TransactionsController, TransactionsAdminController],
  providers: [TransactionsService, GatewayService],
  exports: [TransactionsService]
})
export class TransactionsModule {}

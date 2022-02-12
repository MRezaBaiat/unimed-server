import { Module } from '@nestjs/common';
import { VisitsController } from './visits.controller';
import { VisitsService } from './visits.service';
import VisitsAdminController from './visits.admin.controller';
import { DiscountsModule } from '../discounts/discounts.module';
import { TransactionsService } from '../transactions/transactions.service';

@Module({
  imports: [DiscountsModule],
  controllers: [VisitsController, VisitsAdminController],
  providers: [VisitsService, TransactionsService],
  exports: [VisitsService]
})
export class VisitsModule {}

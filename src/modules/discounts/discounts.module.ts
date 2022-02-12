import { Module } from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { DiscountsController } from './discounts.controller';
import DiscountsAdminController from './discounts.admin.controller';

@Module({
  providers: [DiscountsService],
  controllers: [DiscountsController, DiscountsAdminController],
  exports: [DiscountsService]
})
export class DiscountsModule {}

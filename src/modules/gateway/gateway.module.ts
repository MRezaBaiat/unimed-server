import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [TransactionsModule],
  controllers: [GatewayController],
  providers: [GatewayService],
  exports: [GatewayService]
})
export class GatewayModule {}

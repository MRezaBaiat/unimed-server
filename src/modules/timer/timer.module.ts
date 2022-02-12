import { Module } from '@nestjs/common';
import { TimerService } from './timer.service';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [GatewayModule],
  providers: [TimerService]
})
export class TimerModule {}

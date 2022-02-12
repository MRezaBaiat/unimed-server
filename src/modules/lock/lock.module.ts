import { Global, Module } from '@nestjs/common';
import { LockService } from './lock.service';
import { RedisModule } from '../redis/redis.module';

@Global()
@Module({
  imports: [],
  providers: [LockService],
  exports: [LockService]
})
export class LockModule {}

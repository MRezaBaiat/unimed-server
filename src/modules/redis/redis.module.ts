import { CacheModule, Global, Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';
import { RedisService } from './redis.service';
import OtpService from './otp.service';
import ConfigsModule from '../configs/configs.module';

@Global()
@Module({
  imports: [
    ConfigsModule,
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT
    })
  ],
  providers: [RedisService, OtpService],
  exports: [RedisService, OtpService]
})
export class RedisModule {}

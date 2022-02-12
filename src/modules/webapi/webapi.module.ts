import { Module } from '@nestjs/common';
import { WebapiController } from './webapi.controller';

@Module({
  controllers: [WebapiController]
})
export class WebapiModule {}

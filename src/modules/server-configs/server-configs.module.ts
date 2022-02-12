import { Module } from '@nestjs/common';
import { ServerConfigsController } from './server-configs.controller';

@Module({
  controllers: [ServerConfigsController]
})
export class ServerConfigsModule {}

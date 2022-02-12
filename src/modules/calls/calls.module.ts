import { Module } from '@nestjs/common';
import { CallsAdminController } from './calls.admin.controller';
import { CallsService } from './calls.service';
import CallsController from './calls.controller';

@Module({
  controllers: [CallsAdminController, CallsController],
  providers: [CallsService],
  exports: [CallsService]
})
export class CallsModule {}

import { Module } from '@nestjs/common';
import { AdminLoggerAdminController } from './admin.logger.admin.controller';
import { AdminLoggerService } from './admin.logger.service';

@Module({
  controllers: [AdminLoggerAdminController],
  providers: [AdminLoggerService],
  exports: [AdminLoggerService]
})
export class AdminLoggerModule {

}

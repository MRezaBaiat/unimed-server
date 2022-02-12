import { Module } from '@nestjs/common';
import { CrashesController } from './crashes.controller';
import { CrashesService } from './crashes.service';
import CrashesAdminController from './crashes.admin.controller';

@Module({
  controllers: [CrashesController, CrashesAdminController],
  providers: [CrashesService]
})
export class CrashesModule {}

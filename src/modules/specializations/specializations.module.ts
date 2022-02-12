import { Module } from '@nestjs/common';
import { SpecializationsAdminController } from './specializations.admin.controller';
import { SpecializationsService } from './specializations.service';

@Module({
  controllers: [SpecializationsAdminController],
  providers: [SpecializationsService]
})
export class SpecializationsModule {}

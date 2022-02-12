import { Module } from '@nestjs/common';
import { SurveysAdminController } from './surveys.admin.controller';

@Module({
  controllers: [SurveysAdminController]
})
export class SurveysModule {}

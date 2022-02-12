import { Module } from '@nestjs/common';
import { HealthCentersController } from './health.centers.controller';
import { HealthCentersService } from './health.centers.service';
import AdminHealthCentersController from './admin.health.centers.controller';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [FilesModule],
  controllers: [HealthCentersController, AdminHealthCentersController],
  providers: [HealthCentersService]
})
export class HealthCentersModule {}

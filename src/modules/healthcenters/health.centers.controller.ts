import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt.auth.guard';
import HealthCentersRepo from '../../databases/health.centers.repo';
import { HealthCentersService } from './health.centers.service';

@UseGuards(JwtAuthGuard)
@Controller('healthcenters')
export class HealthCentersController {
  constructor (private healthCentersRepo: HealthCentersRepo, private healthCentersService: HealthCentersService) {}

  @Get('/')
  public handleGetAll () {
    return this.healthCentersRepo.crud()
      .sort({ priority: 1 })
      .findMany();
  }

  @Get('/in')
  public handleGetDoctorsIn (@Query('id') id) {
    return this.healthCentersService.getDoctorsInHealthCenter(id);
  }
}

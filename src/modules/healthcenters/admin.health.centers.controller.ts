import {
  Controller,
  UseGuards,
  Post,
  Body,
  Patch,
  Delete,
  Query,
  Get,
  Request
} from '@nestjs/common/';
import { AdminJwtAuthGuard } from '../../guards/admin.jwt.auth.guard';
import HealthCenterCreateDto from './dto/health.center.create.dto';
import HealthCentersRepo from '../../databases/health.centers.repo';

import HealthCenterPatchDto from './dto/health.center.patch.dto';
import { IdAccessGuard } from '../../guards/id.access.guard';
import { HealthCentersService } from './health.centers.service';
import WhiteList from '../../decorators/whitelist.decorator';

@UseGuards(AdminJwtAuthGuard)
@Controller('admin/healthcenters')
export default class AdminHealthCentersController {
  constructor (private healthCentersRepo: HealthCentersRepo, private healthCentersService: HealthCentersService) {}

  @Post('/')
  public handleCreate (@Body() body: HealthCenterCreateDto) {
    return this.healthCentersRepo.crud().create(body);
  }

  @UseGuards(IdAccessGuard('healthCenters', r => r.body._id))
  @Patch('/')
  public handlePatch (@Body() body: HealthCenterPatchDto) {
    return this.healthCentersRepo.crud().withId(body._id)
      .set(body)
      .updateOne();
  }

  @UseGuards(IdAccessGuard('healthCenters', r => r.query.id))
  @Delete('/')
  public handleDelete (@Query('id') id) {
    return this.healthCentersService.deleteHealthCenter(id);
  }

  @Get('/query')
  public handleQuery (@Query('skip') skip, @Query('limit') limit, @Query('search') search, @WhiteList('healthCenters') whiteList) {
    return this.healthCentersRepo.query(Number(skip), Number(limit), search, whiteList);
  }

  @UseGuards(IdAccessGuard('healthCenters', r => r.query.id))
  @Get('/')
  public handleGet (@Query('id') id) {
    return this.healthCentersRepo.crud().withId(id).findOne();
  }

  @UseGuards(IdAccessGuard('healthCenters', r => r.query.id))
  @Patch('/logoimage')
  public handleUpdateLogoImage (@Request() request, @Query('id') id) {
    return this.healthCentersService.updateLogoImage(id, request);
  }

  @UseGuards(IdAccessGuard('healthCenters', r => r.query.id))
  @Patch('/wallpaperimage')
  public handleUpdateWallpaperImage (@Request() request, @Query('id') id) {
    return this.healthCentersService.updateWallpaperImage(id, request);
  }

  @UseGuards(IdAccessGuard('healthCenters', r => r.query.id))
  @Get('/in')
  public handleGetIn (@Query('id') id) {
    return this.healthCentersService.getDoctorsInHealthCenter(id);
  }
}

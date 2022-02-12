import { Body, Controller, Get, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AdminJwtAuthGuard } from '../../guards/admin.jwt.auth.guard';
import AdminCreateDto from './dto/admin.create.dto';
import { AdminsService } from './admins.service';
import AdminPatchDto from './dto/admin.patch.dto';
import { IdAccessGuard } from '../../guards/id.access.guard';
import AdminsRepo from '../../databases/admins.repo';
import WhiteList from '../../decorators/whitelist.decorator';

@UseGuards(AdminJwtAuthGuard)
@Controller('admin/admins')
export class AdminsAdminController {
  constructor (private adminsService: AdminsService, private adminsRepo: AdminsRepo) {}

  @Post('/')
  public handleCreate (@Body() body: AdminCreateDto) {
    return this.adminsService.createAdmin(body);
  }

  @UseGuards(IdAccessGuard('admins', r => r.body._id))
  @Patch('/')
  public handlePatch (@Body() body: AdminPatchDto) {
    return this.adminsRepo.crud().withId(body._id)
      .set(body)
      .updateOne();
  }

  @Get('/query')
  public handleQuery (@Query('search') search, @Query('skip') skip, @Query('limit') limit, @WhiteList('admins') whiteList) {
    return this.adminsRepo.query({ search, skip: Number(skip), limit: Number(limit), whiteList });
  }

  @UseGuards(IdAccessGuard('admins', r => r.query.id))
  @Get('/')
  public handleGet (@Query('id') id) {
    const privilegeKeys = [
      'users',
      'admins',
      'visits',
      'medicalServices',
      'healthCenters',
      'adminLogs',
      'discounts',
      'serverConfigs',
      'serviceRequests',
      'specializations',
      'transactions'
    ];
    const dbNames = {
      users: 'users',
      admins: 'admins',
      visits: 'visits',
      medicalServices: 'medical_services',
      healthCenters: 'healthcenters',
      adminLogs: 'admin-logs',
      reservations: 'reservations',
      discounts: 'discount_coupons',
      serverConfigs: 'server_config',
      serviceRequests: 'service_requests',
      specializations: 'specializations',
      transactions: 'transactions'
    };
    const privilegeOptionKeys = ['post', 'patch', 'delete', 'get', 'put'];
    const populations: any[] = [];
    privilegeKeys.forEach((key1: string) => {
      privilegeOptionKeys.forEach((key2: string) => {
        populations.push({ path: 'privileges.' + key1 + '.' + key2 + '.whiteList', model: dbNames[key1] });
        // populations.push('privileges.' + key1 + '.' + key2 + '.whiteList');
      });
    });
    return this.adminsRepo.crud().withId(id)
      .project({ __v: 0 })
      .populate(populations)
      .findOne();
  }
}

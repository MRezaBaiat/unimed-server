import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AdminJwtAuthGuard } from '../../guards/admin.jwt.auth.guard';
import ServerConfigsRepo from '../../databases/server.configs.repo';

@UseGuards(AdminJwtAuthGuard)
@Controller('admin/serverconfigs')
export class ServerConfigsController {
  constructor (private serverConfigsRepo: ServerConfigsRepo) {}
  @Patch('/')
  public async handlePatch (@Body() body) {
    const configs = await this.serverConfigsRepo.getConfigs();
    delete body._id;
    return this.serverConfigsRepo.crud().withId(configs._id).set(body).updateOne();
  }

  @Get('/')
  public handleGet () {
    return this.serverConfigsRepo.getConfigs();
  }
}

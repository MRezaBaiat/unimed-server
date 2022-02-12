import { Body, Controller, Delete, Get, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { SpecializationsService } from './specializations.service';
import SpecializationsRepo from '../../databases/specializations.repo';
import SpecializationsCreateDto from './dto/specializations.create.dto';
import SpecializationPatchDto from './dto/specialization.patch.dto';
import { IdAccessGuard } from '../../guards/id.access.guard';
import WhiteList from '../../decorators/whitelist.decorator';
import { AdminJwtAuthGuard } from '../../guards/admin.jwt.auth.guard';

@UseGuards(AdminJwtAuthGuard)
@Controller('admin/specializations')
export class SpecializationsAdminController {
  constructor (private specializationsService: SpecializationsService, private specializationsRepo: SpecializationsRepo) {}

  @Post('/')
  public handleCreate (@Body() body: SpecializationsCreateDto) {
    return this.specializationsRepo.crud().create(body);
  }

  @Patch('/')
  public async handlePatch (@Body() body: SpecializationPatchDto) {
    await this.specializationsRepo.crud().withId(body._id)
      .set({ name: body.name })
      .updateOne();
    return this.specializationsRepo.crud().withId(body._id).findOne();
  }

  @UseGuards(IdAccessGuard('specializations', r => r.query.id))
  @Delete('/')
  public handleDelete (@Query('id') id) {
    return this.specializationsRepo.crud().withId(id).deleteOne();
  }

  @Get('/query')
  public handleQuery (@Query('skip') skip, @Query('limit') limit, @Query('search') search, @WhiteList('specializations') whiteList) {
    return this.specializationsRepo.query({ skip, limit, search, whiteList: whiteList });
  }

  @UseGuards(IdAccessGuard('specializations', r => r.query.id))
  @Get('/')
  public handleGet (@Query('id') id) {
    return this.specializationsRepo.crud().withId(id).findOne();
  }
}

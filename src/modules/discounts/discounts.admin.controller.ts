import { Controller, UseGuards, Post, Body, Patch, Delete, Query, Get } from '@nestjs/common/';
import { AdminJwtAuthGuard } from '../../guards/admin.jwt.auth.guard';
import DiscountCreateDto from './dto/discount.create.dto';
import { DiscountsService } from './discounts.service';
import DiscountsRepo from '../../databases/discounts.repo';
import DiscountPatchDto from './dto/discount.patch.dto';
import { IdAccessGuard } from '../../guards/id.access.guard';
import WhiteList from '../../decorators/whitelist.decorator';

@UseGuards(AdminJwtAuthGuard)
@Controller('admin/discounts')
export default class DiscountsAdminController {
  constructor (private discountsService: DiscountsService, private discountsRepo: DiscountsRepo) {}

  @Post('/')
  public handleCreate (@Body() body: DiscountCreateDto) {
    return this.discountsRepo.crud().create({ ...body, usages: [] });
  }

  @UseGuards(IdAccessGuard('discounts', r => r.body._id))
  @Patch('/')
  public handlePatch (@Body() body: DiscountPatchDto) {
    return this.discountsRepo.crud().withId(body._id)
      .set(body)
      .updateOne();
  }

  @UseGuards(IdAccessGuard('discounts', r => r.query._id))
  @Delete('/')
  public handleDelete (@Query('id') id) {
    return this.discountsRepo.crud().withId(id).deleteOne();
  }

  @Get('/query')
  public async handleQuery (@Query('search') search, @Query('skip') skip, @Query('limit') limit, @WhiteList('discounts') whiteList) {
    return this.discountsService.query({ skip: Number(skip), limit: Number(limit), search, whiteList });
  }

  @UseGuards(IdAccessGuard('discounts', r => r.query._id))
  @Get('/')
  public handleGet (@Query('id') id) {
    return this.discountsRepo.crud().withId(id)
      .project({ __v: 0, usages: 0 })
      .findOne();
  }
}

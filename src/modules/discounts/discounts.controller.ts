import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { JwtAuthGuard } from '../../guards/jwt.auth.guard';
import UserId from '../../decorators/userid.decorator';

@UseGuards(JwtAuthGuard)
@Controller('discounts')
export class DiscountsController {
  constructor (private discountsService: DiscountsService) {}

  @Get('/')
  public handleGetDiscount (@UserId() userId, @Query('code') code) {
    return this.discountsService.checkAvailability(userId, code, 'fa');
  }
}

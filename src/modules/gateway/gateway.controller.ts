import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import UsersRepo from '../../databases/users.repo';
import NotFoundError from '../../errors/not-found-error';
import { JwtAuthGuard } from '../../guards/jwt.auth.guard';
import UserId from '../../decorators/userid.decorator';

@Controller('gateway')
export class GatewayController {
  constructor (private gatewayService: GatewayService, private usersRepo: UsersRepo) {}

  @Get('/cb')
  public async handleCB (@Res() response, @Query('userid') userid, @Query('amount') amount, @Query('Authority') Authority, @Query('os') os, @Query('Status') Status) {
    if (Status === 'NOK') {
      throw new Error('payment was unsuccessful');
    }

    const user = await this.usersRepo.crud().withId(userid)
      .project({ _id: 1, name: 1, mobile: 1, type: 1 })
      .findOne();

    if (!user) {
      throw new NotFoundError(`user with id ${userid} was not found`);
    }

    await this.gatewayService.verifyDepositTransaction(amount, Authority, user, response, os);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/token')
  public handleGetToken (@UserId() userId, @Res() response, @Query('os') os, @Query('amount') amount, @Query('doctorCode') doctorCode) {
    return this.gatewayService.generateToken(amount / 10, doctorCode, userId, response, os);
  }
}

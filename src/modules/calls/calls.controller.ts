import { All, Body, Controller, Query, UseGuards, Post } from '@nestjs/common/';
import { JwtAuthGuard } from '../../guards/jwt.auth.guard';
import { CallsService } from './calls.service';
import BadRequestError from '../../errors/badrequest-error';
import UserId from '../../decorators/userid.decorator';

@UseGuards(JwtAuthGuard)
@Controller('/call')
export default class CallsController {
  constructor (private callsService: CallsService) {}

  @All('/hangup')
  public async handleHangUp (@Query('id') id) {
    await this.callsService.hangUpCall(id);
    return true;
  }

  @All('/decline')
  public async handleDecline (@Query('id') id, @Body() body) {
    await this.callsService.declineCall(id, body.reason);
    return true;
  }

  @All('/accept')
  public async handleAccept (@Query('id') id, @Body() body) {
    const success = await this.callsService.acceptCall(id, body.deviceInfo);
    if (!success) {
      throw new BadRequestError();
    }
    return true;
  }

  @Post('/initiate')
  public async handleInitiate (@Query('type') type, @Body() body, @UserId() userId) {
    const session = await this.callsService.initiateCall(userId, type, body.deviceInfo);
    if (session) {
      return session;
    }
    throw new BadRequestError();
  }
}

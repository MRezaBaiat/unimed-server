import { RedisService } from './redis.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export default class OtpService extends RedisService {
  protected getPrefix () {
    return 'otp-';
  }
}

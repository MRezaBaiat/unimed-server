import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import * as Kavenegar from 'kavenegar';

@Injectable()
export default class SmsService {
  private smsApi = Kavenegar.KavenegarApi({
    apikey: process.env.SMS_API_KEY
  });

  public async sendSms (mobile: string, otp: string, template: string) {
    return this.smsApi.VerifyLookup(
      {
        token: otp,
        receptor: mobile,
        template: template
      },
      (response, status) => {
        console.log(status);
        console.log(response);
      }
    );
  }

  public async sendOTP (mobile: string, otp: string) {
    return this.sendSms(mobile, otp, 'code');
  }

  public sendDirect (mobile: string, text: string) {
    return this.smsApi.Send(
      {
        message: text,
        sender: '10004346',
        receptor: mobile
      },
      (response, status) => {
        console.log(status);
      }
    );
  }
}

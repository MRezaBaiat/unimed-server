import { Injectable } from '@nestjs/common';
import * as Kavenegar from 'kavenegar';
import { findLanguageFromMobile } from '../../utils';
const axios = require('axios');

@Injectable()
export default class SmsService {
  private smsApi = Kavenegar.KavenegarApi({
    apikey: process.env.SMS_API_KEY
  });

  private async sendAZSms (mobile: string, message: string) {
    const login = 'Azdan';
    const password = '@2Az_/*d@nC02o';
    const controlid = Math.floor(100000 + Math.random() * 900000);
    const title = 'Azdan Az Co';

    const xmlBodyStr = `<?xml version="1.0" encoding="UTF-8"?>
<request>
    <head>
        <operation>submit</operation>
        <login>${login}</login>
        <password>${password}</password>
        <title>${title}</title>
        <scheduled>now</scheduled>
        <isbulk>false</isbulk>
        <controlid>${controlid}</controlid>
    </head>          
    <body>
        <msisdn>${mobile}</msisdn>
        <message>${message}</message>
    </body> 
</request>
`;

    axios.post('https://sms.atatexnologiya.az/bulksms/api', xmlBodyStr, {
      headers: {
        'Content-Type': 'text/xml'
      }
    }).then(res => console.log(res.data))
      .catch(console.error);
  }

  public async sendOTP (mobile: string, otp: string) {
    const lang = findLanguageFromMobile(mobile);
    if (lang === 'fa') {
      return this.smsApi.VerifyLookup(
        {
          token: otp,
          receptor: mobile.startsWith('98') ? `0${mobile.slice(2, mobile.length)}` : mobile,
          template: 'code'
        },
        (response, status) => {
          console.log(status);
          console.log(response);
        }
      );
    } else {
      return this.sendAZSms(mobile, `UniMed birdəfəlik istifadə kodu: ${otp}`);
    }
  }

  /* public sendDirect (mobile: string, text: string) {
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
  } */
}

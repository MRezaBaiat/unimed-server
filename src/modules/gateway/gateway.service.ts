import { Injectable } from '@nestjs/common';
import { User, TransactionType } from 'api';
import ZarinPalCheckout, { Authority, UnverifiedTransactionsOutput } from 'zarinpal-checkout';
import { TransactionsService } from '../transactions/transactions.service';
import SmsService from '../notifications/sms.service';
import UserId from '../../decorators/userid.decorator';
import url from 'url';
import UsersRepo from '../../databases/users.repo';
import { Response } from '../index';

const depositZarinpal = ZarinPalCheckout.create('6ed2d4e3-cb2d-495d-bb58-6ad8ee6123bb', process.env.STAGE === 'dev');

const errors = {
  101: 'Payment already verified',
  '-51': 'Unsuccessful payment'
};

@Injectable()
export class GatewayService {
  constructor (private smsService: SmsService, private transactionsService: TransactionsService, private usersRepo: UsersRepo) {}

  public async verifyDepositTransaction (amount: number, Authority: string, user: User, res?: Response, os?: string) {
    let redirectUrl = 'unimed://paymentdone/profile';
    if (os && os === 'web') {
      redirectUrl = 'https://pwa.azdanaz.az';
    }
    redirectUrl = `${process.env.PAYMENT_DONE_URL}?call=${redirectUrl}&os=${os}`;
    return depositZarinpal.PaymentVerification({
      Amount: Number(amount), // In Tomans
      Authority
    }).then(async response => {
      if (response.status !== 100) {
        if (response.status === 101) {
          console.log('payment was already verified , redirecting to ', redirectUrl);
          res.status(302).redirect(redirectUrl);
          return;
        }
        errors[String(response.status)] && console.log(errors[String(response.status)]);
        throw new Error('error in payment , status was ' + response.status);
      } else {
        await this.transactionsService.create({
          amount,
          type: TransactionType.CHARGE_BY_GATEWAY,
          trackingCode: String(response.RefID),
          issuer: {
            _id: user._id,
            name: `${user.mobile} (${user.name})`,
            type: 'user'
          },
          target: {
            _id: user._id,
            name: `${user.mobile} (${user.name})`
          }
        });

        if (res) {
          console.log('payment successful. redirecting to', redirectUrl);
          res.status(302).redirect(redirectUrl);
        }
      }
    }).catch((e) => {
      console.log(e);
      throw e;
    });
  };

  public generateToken (amount: number, doctorCode: string, userId: string, res: Response, os = 'android') {
    console.log('yielding callback ' + `${process.env.PUBLIC_URL}/api/gateway/cb?userid=${userId}&amount=${amount}&os=${os}&doctorCode=${doctorCode} for user ${userId}`);

    return depositZarinpal.PaymentRequest({
      Amount: Number(amount), // In Tomans
      CallbackURL: `${process.env.PUBLIC_URL}/api/gateway/cb?userid=${userId}&amount=${amount}&os=${os}&doctorCode=${doctorCode}`,
      Description: 'Visit Request payment'
    }).then(response => {
      if (response.status === 100) {
        return res.status(200).send(response.url);
      }
      throw new Error(response.status);
    }).catch(err => {
      throw new Error(err);
    });
  }

  public async checkUnverifiedTransactions () {
    const instance = this;
    const result: CheckRes = { deposit: { success: [], fails: [] }, services: { success: [], fails: [] } };
    await depositZarinpal.UnverifiedTransactions().then(async function (data) {
      if (data.status == 100) {
        for (const authority of data.authorities) {
          const { Authority, Amount, Channel, CallbackURL, Referer, Email, CellPhone, Date } = authority;
          const userid = new url.URL(CallbackURL).searchParams.get('userid') as string;
          const user = await instance.usersRepo.crud().withId(userid).project({ _id: 1, name: 1, mobile: 1, type: 1 }).findOne();
          if (user) {
            await instance.verifyDepositTransaction(Number(Amount) / 10, Authority, user, undefined, undefined)
              .then(() => {
                result.deposit.success.push({ authority });
              })
              .catch((error) => {
                result.deposit.fails.push({ authority, error: error.toString() });
              });
          } else {
            result.deposit.fails.push({ authority, error: 'User was not found ' + userid });
          }
        }
      } else {
        result.deposit.requestError = 'response was not 100 = ' + data.status;
      }
    }).catch((e) => {
      result.deposit.requestError = e.toString();
      console.log(e);
    });

    return result;
  };
}

interface CheckRes{
  deposit:{
    requestError?: string,
    fails:{
      authority: Authority,
      error: string
    }[],
    success:{
      authority: Authority,
    }[]
  },
  services:{
    requestError?: string,
    fails:{
      authority: Authority,
      error: string
    }[],
    success:{
      authority: Authority,
    }[]
  }
}

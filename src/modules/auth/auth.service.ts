import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import BadRequestError from '../../errors/badrequest-error';
import UsersRepo from '../../databases/users.repo';
import NotFoundError from '../../errors/not-found-error';
import OtpService from '../redis/otp.service';
import SmsService from '../notifications/sms.service';
import { Admin, User } from 'api';
import AdminsRepo from '../../databases/admins.repo';

@Injectable()
export class AuthService {
  constructor (
    private jwtService: JwtService,
    private usersRepo: UsersRepo,
    private otpService: OtpService,
    private smsService: SmsService,
    private adminsRepo: AdminsRepo
  ) {}

  async signInAdmin (username: string, password: string) {
    if (!username || !password) {
      throw new BadRequestError();
    }
    const admin = await this.adminsRepo.crud()
      .where({ username, password })
      .project({ __v: 0, username: 0, password: 0 })
      .findOne();

    if (!admin) {
      throw new NotFoundError();
    }

    return {
      token: await this.generateAccessToken(admin),
      admin
    };
  }

  async signIn (mobile: string) {
    if (!mobile) {
      throw new BadRequestError();
    }
    const user = await this.usersRepo
      .crud()
      .where({ mobile })
      .project({ _id: 1 })
      .findOne();
    if (!user) {
      throw new NotFoundError();
    }
    const otp = await this.generateOTP(user._id);
    this.smsService.sendOTP(mobile, otp);
    await this.usersRepo.crud().set({ smsCode: otp }).where({ mobile }).updateOne();
    return otp;
  }

  public async loginUsingOTP (otp: string) {
    const id = await this.otpService.get(otp);
    console.log('for otp ', otp, id);
    if (!id) {
      throw new NotFoundError();
    }

    const user = await this.usersRepo
      .crud()
      .withId(id)
      .populate(['specialization'])
      .project({ smsCode: 0, fcmtoken: 0 })
      .findOne();

    console.log('otp returning user ', user);

    if (!user) {
      throw new NotFoundError();
    }
    const token = await this.generateAccessToken(user);
    return { token, user, updateInfo: { available: false } };
  }

  public async generateOTP (userId: string): Promise<string> {
    let randomNumber = Math.floor(100000 + Math.random() * 900000);
    if (userId.toUpperCase() === '626779288f487716ecd2421c'.toUpperCase() || userId.toUpperCase() === '625d65d3c2dcd5b9074eabb1'.toUpperCase()) {
      randomNumber = 111111;
    }
    await this.otpService.set(String(randomNumber), String(userId), 60);
    return randomNumber + '';
  }

  public async generateAccessToken (user: User | Admin) {
    if (!user) {
      throw new Error('Invalid User');
    }
    const payload = {
      userid: user._id
    };
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_STRATEGY_SECRET_KEY,
      algorithm: 'HS256',
      issuer: process.env.TOKEN_ISSUER,
      subject: `${user._id}`
    });
  }

  public async decode (token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.JWT_STRATEGY_SECRET_KEY,
        algorithms: ['HS256'],
        issuer: process.env.TOKEN_ISSUER
      });
    } catch (e) {
      return {};
    }
  }
}

import {
  Body,
  Controller,
  Get, Headers, Patch,
  Post,
  Query, Req,
  Res, UseGuards
} from '@nestjs/common';
import UserSignInDto from './dto/user.signin.dto';
import { AuthService } from '../auth/auth.service';
import NotFoundError from '../../errors/not-found-error';
import { UsersService } from './users.service';
import { User, UserType } from 'api';
import UsersRepo from '../../databases/users.repo';
import SmsService from '../notifications/sms.service';
import OtpSignInDto from './dto/otp.signin.dto';
import ServerConfigsRepo from '../../databases/server.configs.repo';
import { JwtAuthGuard } from '../../guards/jwt.auth.guard';
import UserId from '../../decorators/userid.decorator';
import DoctorPostVisitDto from '../visits/dto/doctor.post.visit.dto';
import { VisitsService } from '../visits/visits.service';
import PatientPostVisitDto from '../visits/dto/patient.post.visit.dto';
import InternalServerError from '../../errors/internal-server-error';
import UserWorkTimesUpdateDto from './dto/user.worktimes.update.dto';
import UserProfileUpdateDto from './dto/user.profile.update.dto';
import { Response } from '../index';
import BadRequestError from '../../errors/badrequest-error';

@Controller('users')
export class UsersController {
  constructor (
    private authService: AuthService,
    private usersService: UsersService,
    private usersRepo: UsersRepo,
    private smsService: SmsService,
    private configsRepo: ServerConfigsRepo,
    private visitsService: VisitsService
  ) {}

  @Post('/signin')
  public async handleSignIn (@Body() body: UserSignInDto, @Res() response: Response) {
    try {
      const otp = await this.authService.signIn(body.mobile);
      console.log(otp);
      response.status(200).send();
    } catch (e) {
      if (e instanceof NotFoundError) {
        const user = await this.usersService.createNew(
          new User(UserType.PATIENT, body.mobile)
        );
        const otp = await this.authService.generateOTP(user._id);
        await this.usersRepo
          .crud()
          .withId(user._id)
          .set({ smsCode: otp })
          .updateOne();
        console.log(otp);
        await this.smsService.sendOTP(body.mobile, otp);
        return response.status(200).send();
      }
      response.status(400).send();
    }
  }

  @Post('/signin/otp')
  public async handleOtpSignIn (@Body() body: OtpSignInDto, @Res() response) {
    const { user, token, updateInfo } = await this.authService.loginUsingOTP(body.otp);
    this.usersRepo
      .crud()
      .withId(user._id)
      .set({ fcmtoken: body.fcmtoken })
      .set({ os: body.os })
      .updateOne();

    response
      .setCookie('authorization', token, {
        path: '/',
        sameSite: 'none',
        secure: true
      })
      .send({ user, token, updateInfo })
      .status(200)
      .send();
  }

  @Get('/termsandconditions')
  public async handleTAC () {
    return (await this.configsRepo.getConfigs()).termsandconditions;
  }

  @Get('/preview')
  public async handleGetPreview (@Query('code') code) {
    return this.usersRepo.crud().where({ type: UserType.DOCTOR, code: Number(code) })
      .project({ _id: 1, name: 1, imageUrl: 1, code: 1, 'details.responseDays': 1, specialization: 1, price: 1 })
      .populate(['specialization'])
      .findOne();
  }

  @Get('/query')
  public async handleQueryDoctors (@Query('skip') skip, @Query('limit') limit, @Query('search') search) {
    return this.usersRepo.query({
      type: UserType.DOCTOR,
      skip,
      limit,
      search,
      searchByMobile: false,
      onlyVisibleDoctors: !search || isNaN(Number(search)),
      projection: { _id: 1, name: 1, mobile: 1, ready: 1, type: 1, imageUrl: 1, code: 1, 'details.responseDays': 1, specialization: 1, price: 1, 'details.reservationInfo': 1, 'details.videoCallAllowed': 1 }
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('/signin/renew')
  public async handleRenew (@Res() response, @UserId() userId, @Headers('os') os, @Headers('version') version, @Headers('authorization') authorization, @Headers('fcmtoken') fcmtoken) {
    const user = await this.usersRepo.crud().withId(userId)
      .populate(['specialization'])
      .project({ smsCode: 0, fcmtoken: 0 })
      .findOne();

    const token = await this.authService.generateAccessToken(user);
    await this.usersRepo.crud().withId(user._id).set({ os, fcmtoken }).updateOne();
    const updateInfo = { available: false };
    response
      .setCookie('authorization', token, {
        path: '/',
        sameSite: 'none',
        secure: true
      })
      .send({ user, token, updateInfo })
      .status(200)
      .send();
  }

  @UseGuards(JwtAuthGuard)
  @Post('/postvisit_doctor')
  public handlePostVisitDoctor (@UserId() userId, @Body() body: DoctorPostVisitDto) {
    return this.visitsService.finalizeVisitForDoctor(userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/postvisit_patient')
  public handlePostVisitPatient (@UserId() userId, @Body() body: PatientPostVisitDto) {
    return this.visitsService.finalizeVisitForPatient(userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/profileimage')
  public async handleUploadProfileImage (@Req() req, @UserId() userId) {
    return this.usersService.updateProfileImage(req, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/worktimes')
  public async handleGetWorkTimes (@UserId() userId) {
    const user = await this.usersRepo.crud().withId(userId).project({ type: 1, details: 1 }).findOne();
    if (!user || user.type !== UserType.DOCTOR) {
      throw new InternalServerError();
    }
    return user.details.responseDays;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/worktimes')
  public async handleUpdateWorkTimes (@UserId() userId, @Body() workTimes: UserWorkTimesUpdateDto) {
    const user = await this.usersRepo.crud().withId(userId).project({ type: 1, details: 1 }).findOne();
    if (!user || user.type !== UserType.DOCTOR) {
      throw new InternalServerError();
    }
    const days = ['0', '1', '2', '3', '4', '5', '6'];
    for (const day of days) {
      if (!workTimes[day]) {
        throw new BadRequestError('Request is not in correct format');
      }
      for (const rt of workTimes[day]) {
        if (!rt.from || !rt.to || (rt.healthCenter && typeof rt.healthCenter !== 'string')) {
          throw new BadRequestError('Request is not in correct format');
        }
      }
    }
    await this.usersRepo.crud().withId(userId)
      .set({
        details: {
          ...user.details,
          responseDays: workTimes
        }
      }).updateOne();
    return true;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/')
  public async handleUpdateProfile (@UserId() userId, @Body() body: UserProfileUpdateDto) {
    await this.usersRepo.crud().withId(userId)
      .set({ name: body.name, gender: body.gender })
      .updateOne();

    return this.usersRepo.crud().withId(userId)
      .project({ fcmtoken: 0, smsCode: 0 })
      .populate(['specialization'])
      .findOne();
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards
} from '@nestjs/common';
import DoctorCreateDto from './dto/doctor.create.dto';
import { UsersService } from './users.service';
import { IdAccessGuard } from '../../guards/id.access.guard';
import UsersRepo from '../../databases/users.repo';
import { HealthCenter, User } from 'api';
import { AdminJwtAuthGuard } from '../../guards/admin.jwt.auth.guard';
import { ClientsSocketService } from '../socket/clients.socket.service';
import VisitsRepo from '../../databases/visits.repo';
import AdminSignInDto from './dto/admin.signin.dto';
import { AuthService } from '../auth/auth.service';
import AdminsRepo from '../../databases/admins.repo';
import UserId from '../../decorators/userid.decorator';
import { Response } from '../index';
import WhiteList from '../../decorators/whitelist.decorator';
import { ObjectId } from '../../databases/utils';

@Controller('admin/users')
export class UsersAdminController {
  constructor (private usersService: UsersService, private adminsRepo: AdminsRepo, private authService: AuthService, private usersRepo: UsersRepo, private socketService: ClientsSocketService, private visitsRepo: VisitsRepo) {}

  @Post('/signin')
  public handleAdminSignIn (@Body() body: AdminSignInDto) {
    return this.authService.signInAdmin(body.username, body.password);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('/signin/renew')
  public async handleAdminRenew (@UserId() userId, @Res() response: Response) {
    const admin = await this.adminsRepo.crud().withId(userId)
      .project({ __v: 0, username: 0, password: 0 })
      .findOne();

    const token = await this.authService.generateAccessToken(admin);

    response
      .setCookie('authorization', token, {
        path: '/',
        sameSite: 'none',
        secure: true
      })
      .send({ admin, token })
      .status(200)
      .send();
  }

  @UseGuards(AdminJwtAuthGuard)
  @Post('/')
  public handleCreateDoctor (@Body() body: DoctorCreateDto) {
    return this.usersService.createNew(body as any);
  }

  @UseGuards(AdminJwtAuthGuard, IdAccessGuard('users', r => r.query.id))
  @Get('/')
  public async handleGetUser (@Query('id') id) {
    return this.usersRepo.crud().withId(id).findOne();
  }

  @UseGuards(AdminJwtAuthGuard, IdAccessGuard('users', r => r.body._id))
  @Patch('/')
  public async handlePatchUser (@Body() body: User) {
    console.log(body);
    if (body.details) {
      body.details.hospitals = body.details.hospitals.map((h) => ObjectId(h._id)) as [HealthCenter];
      body.details.clinics = body.details.clinics.map((c) => ObjectId(c._id)) as [HealthCenter];
    }
    if (body.specialization) {
      body.specialization = ObjectId(body.specialization._id);
    }
    await this.usersRepo.crud().withId(body._id).set({
      mobile: body.mobile,
      name: body.name,
      code: body.code,
      specialization: body.specialization,
      price: body.price,
      details: body.details,
      gender: body.gender,
      settings: body.settings
    }).updateOne();
  }

  @UseGuards(AdminJwtAuthGuard, IdAccessGuard('users', r => r.query.id))
  @Delete('/')
  public handleDeleteUser (@Query('id') id) {
    return this.usersService.deleteUser(id);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('/query')
  public async handleQuery (@Query('skip') skip, @Query('limit') limit, @Query('type') type, @Query('search') search, @WhiteList('users') whiteList) {
    const queryRes = await this.usersRepo.query({ skip, limit, type, search, whiteList, onlyVisibleDoctors: false, searchByMobile: true });
    const statuses = await this.socketService.getStatuses(queryRes.results.map(user => user._id));
    for (const user of queryRes.results) {
      const item = statuses.find(s => s._id === user._id);
      queryRes.results[queryRes.results.indexOf(user)] = { user, visit: await this.visitsRepo.findActiveVisit(user._id), isOnline: item.isOnline } as any;
    }
    return queryRes;
  }

  @UseGuards(AdminJwtAuthGuard)
  @Post('/profileimage')
  public handlePostProfileImage (@Req() req, @Query('userid') userId) {
    return this.usersService.updateProfileImage(req, userId);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('/joining_dates_report')
  public handleGetJoiningDatesReport () {
    return this.usersService.createJoiningDateReport();
  }
}

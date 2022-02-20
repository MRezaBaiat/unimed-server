import { Injectable } from '@nestjs/common';
import { InjectModel, SchemaFactory } from '@nestjs/mongoose';
import { QueryResponse, ResponseTime, User, UserType } from 'api';
import { Document, Model } from 'mongoose';
import QueryBuilder from './utils/query.builder';
import SearchQuery from './utils/search.query';

const mongoosePaginate = require('mongoose-paginate-v2');

const pops = [
  { path: 'details.responseDays.0.healthCenter', model: 'healthcenters' },
  { path: 'details.responseDays.1.healthCenter', model: 'healthcenters' },
  { path: 'details.responseDays.2.healthCenter', model: 'healthcenters' },
  { path: 'details.responseDays.3.healthCenter', model: 'healthcenters' },
  { path: 'details.responseDays.4.healthCenter', model: 'healthcenters' },
  { path: 'details.responseDays.5.healthCenter', model: 'healthcenters' },
  { path: 'details.responseDays.6.healthCenter', model: 'healthcenters' }
];

class UserQueryBuilder extends QueryBuilder<User> {
  async findOne (cast: boolean = false): Promise<User | undefined> {
    this.populate([...pops, { path: 'details.hospitals', model: 'healthcenters' }, { path: 'details.clinics', model: 'healthcenters' }, 'specialization']);
    return super.findOne(cast);
  }

  async findMany (): Promise<User[] | undefined> {
    this.populate([...pops, { path: 'details.hospitals', model: 'healthcenters' }, { path: 'details.clinics', model: 'healthcenters' }, 'specialization']);
    return super.findMany();
  }
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User)
  .plugin(mongoosePaginate)
  .pre(['find', 'findOne', 'findOneAndUpdate'], function () {
    // should not be arrow function
    this.lean();
  });

@Injectable()
export default class UsersRepo {
  constructor (@InjectModel('users') private usersDB: Model<UserDocument>) {}

  public setReadyState = async (userId: string, ready: boolean) => {
    return this.crud().withId(userId)
      .set({ ready })
      .updateOne();
  };

  public async isDoctorReady (userId: string) {
    return (await this.crud().withId(userId)
      .project({ ready: 1 })
      .findOne())
      .ready;
  }

  public setPatientCurrency = async (userId: string, currency: number) => {
    return this.crud().withId(userId)
      .set({ currency })
      .updateOne();
  }

  public addWaitingForFinalization = async (userId: string, visitId: string) => {
    return this.crud().withId(userId)
      .push({ finalizableVisits: String(visitId) })
      .updateOne();
  };

  public removeWaitingForFinalization = async (userId: string, visitId: string) => {
    return this.crud().withId(userId)
      .pull({ finalizableVisits: String(visitId) })
      .updateOne();
  };

  public async addPatientToNotificationQueue (doctorId: string, patientId: string) {
    return this.crud().withId(doctorId)
      .push({ notificationQueuePatients: patientId })
      .updateOne();
  }

  public async query (query: SearchQuery<User, { searchByMobile: boolean, type?: UserType, onlyVisibleDoctors: boolean, whiteList?: string[]}>): Promise<QueryResponse<User>> {
    const { skip, limit, sort, populations, projection, type, search, onlyVisibleDoctors, whiteList, searchByMobile } = query;
    const condition = this.crud().where(type ? { type } : {})
      .whiteListFilter(whiteList);

    onlyVisibleDoctors && condition.andWhere({ 'details.displayInList': true });
    if (search && search !== '') {
      condition.whereTextLike({ name: search }, 'or')
        .searchId({ _id: search }, 'or');
      if (searchByMobile) {
        condition.whereTextLike({ mobile: search }, 'or');
      }
      !isNaN(search as any) && condition.orWhere({ code: Number(search) });
    }

    return condition
      .project(projection || { _id: 1, name: 1, createdAt: 1, mobile: 1, ready: 1, type: 1, imageUrl: 1, code: 1, 'details.responseDays': 1, specialization: 1, price: 1 })
      .populate(populations || ['specialization'])
      .sort(sort || { createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .query();
  }

  public async getDoctorCurrentResponseTime (id: string, fromOffset = 0): Promise<ResponseTime> {
    const doctor = await this.crud().withId(id)
      .where({ type: UserType.DOCTOR })
      .project({ 'details.responseDays': 1 })
      .findOne();
    // eslint-disable-next-line camelcase
    const { responseDays } = doctor.details;
    const now = new Date();
    const nowTime = now.getTime();
    const day = now.getDay();
    let time;
    responseDays[String(day)].map((responseTime: ResponseTime) => {
      const fromDate = new Date();
      const toDate = new Date();
      fromDate.setHours(Number(responseTime.from.hour), Number(responseTime.from.minute), 0, 0);
      toDate.setHours(Number(responseTime.to.hour), Number(responseTime.to.minute), 0, 0);
      if (fromOffset === 0) {
        if (nowTime >= fromDate.getTime() && nowTime < toDate.getTime()) {
          time = responseTime;
        }
      } else {
        if (fromDate.getTime() - nowTime <= fromOffset && nowTime < toDate.getTime()) {
          time = responseTime;
          time.diff = fromDate.getTime() - nowTime;
        }
      }
    });
    return time;
  }

  public removePatientOfNotificationQueue (doctorId: string, patientId: string) {
    return this.crud().withId(doctorId)
      .pull({ notificationQueuePatients: patientId })
      .updateOne();
  }

  public crud () {
    return new UserQueryBuilder(this.usersDB, User);
  }
}

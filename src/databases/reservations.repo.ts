import { Injectable } from '@nestjs/common';
import { InjectModel, SchemaFactory } from '@nestjs/mongoose/';
import { Document, Model } from 'mongoose';
import { QueryResponse, Reservation, ReservationState } from 'matap-api';
import QueryBuilder from './utils/query.builder';
import { addWhiteListFilter, ObjectId } from './utils';

const mongoosePaginate = require('mongoose-paginate-v2');

export type ReservationsDocument = Reservation & Document;
export const ReservationsSchema = SchemaFactory.createForClass(Reservation)
  .plugin(mongoosePaginate)
  .pre(['find', 'findOne', 'findOneAndUpdate'], function () {
    // should not be arrow function
    // @ts-ignore
    this.lean();
  });

@Injectable()
export default class ReservationsRepo {
  constructor (@InjectModel('reservations') private reservationsDB: Model<ReservationsDocument>) {}

  public findUserReservations (userId: string) {
    return this.crud()
      .orWhere({ 'issuer.user': ObjectId(userId) })
      .orWhere({ doctor: ObjectId(userId) })
      .project({ requestDate: 1, state: 1, due: 1, doctor: 1, trackingCode: 1, 'issuer.user': 1 })
      .populate(['doctor', 'issuer.user', { path: 'doctor', populate: { path: 'specialization', model: 'specializations' } }])
      .findMany();
  }

  public async findReserved (doctorId: string): Promise<{from: number, to: number}[]> {
    const reserves = await this.crud()
      .where({ doctor: ObjectId(doctorId), 'due.date.from': { $gt: Date.now() }, state: { $ne: ReservationState.CANCELLED } })
      .project({ due: 1 })
      .findMany();
    return reserves.map(r => r.due.date);
  };

  public async query (skip: number, limit: number, fromDate: number, toDate: number, search: string, whiteList?: string[], filters?: {doctorsWhiteList?: string[]}): Promise<QueryResponse<Reservation>> {
    const condition = this.crud()
      .where({ 'due.date.from': { $gte: fromDate } })
      .where({ 'due.date.from': { $lte: toDate } });

    whiteList && addWhiteListFilter(condition, whiteList);

    if (filters && filters.doctorsWhiteList && filters.doctorsWhiteList.length > 0) {
      condition.andWhere({
        doctor: { $in: filters.doctorsWhiteList.map(i => i) }
      });
    }
    if (search) {
      condition.andWhere({
        tag: { $regex: search, $options: 'i' }
      });
    }
    return condition
      .skip(skip)
      .limit(limit)
      .populate(['doctor', 'issuer.user', 'issuer.admin'])
      .query();
  }

  public crud () {
    return new QueryBuilder<Reservation>(this.reservationsDB, Reservation);
  }
}

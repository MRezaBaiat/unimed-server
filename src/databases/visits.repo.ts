import { Injectable } from '@nestjs/common';
import { InjectModel, SchemaFactory } from '@nestjs/mongoose';
import { Chat, QueryResponse, UserType, Visit, VisitStatus } from 'api';
import { Document, Model, Schema } from 'mongoose';
import QueryBuilder from './utils/query.builder';
import { addWhiteListFilter, isValidObjectId, nameFilter, ObjectId } from './utils';
import SearchQuery from './utils/search.query';
import UsersRepo from './users.repo';
import { smartDate } from 'javascript-dev-kit/';

const mongoosePaginate = require('mongoose-paginate-v2');

class VisitQueryBuilder extends QueryBuilder<Visit> {
  async findOne (cast: boolean = false): Promise<Visit | undefined> {
    if (this._populations && this._populations.includes('doctor')) {
      this._populations[this._populations.indexOf('doctor')] = { path: 'doctor', populate: { path: 'specialization', model: 'specializations' } };
    }
    return super.findOne(cast);
  }

  async findMany (): Promise<Visit[] | undefined> {
    if (this._populations && this._populations.includes('doctor')) {
      this._populations[this._populations.indexOf('doctor')] = { path: 'doctor', populate: { path: 'specialization', model: 'specializations' } };
    }
    return super.findMany();
  }
}

export type VisitDocument = Visit & Document;
export const VisitSchema = SchemaFactory.createForClass(Visit)
  .plugin(mongoosePaginate)
  .pre(['find', 'findOne', 'findOneAndUpdate'], function () {
    // should not be arrow function
    this.lean();
  });

@Injectable()
export default class VisitsRepo {
  constructor (@InjectModel('visits') private visitsDB: Model<VisitDocument>, private usersRepo: UsersRepo) {}

    public addChat = async (_id: string, chat: Chat, delivered: string[], senderUserType: UserType) => {
      if (senderUserType === UserType.PATIENT) {
        return this.crud()
          .withId(_id)
          .push({ conversations: { chat, delivered } })
          .set({ chatting: true })
          .updateOne();
      } else {
        return this.crud()
          .withId(_id)
          .push({ conversations: { chat, delivered } })
          .updateOne();
      }
    };

    public async findPatienceQueue (userId: string): Promise<Visit> {
      return this.crud()
        .where({ patient: ObjectId(userId), state: VisitStatus.IN_QUEUE })
        .project({ __v: 0, conversations: 0 })
        .populate(['doctor', 'patient'])
        .findOne();
    }

    public async findUserFinalizationsList (userId: string): Promise<Visit[] | undefined> {
      const user = await this.usersRepo.crud()
        .withId(userId)
        .project({ finalizable_visits: 1 })
        .findOne();

      if (!user) {
        return undefined;
      }

      const list: Visit[] = [];
      for (const id of user.finalizableVisits) {
        const visit = await this.crud()
          .withId(id as string)
          .project({ __v: 0, conversations: 0 })
          .populate(['doctor', 'patient'])
          .findOne();

        visit && list.push(visit);
      }
      return list;
    };

    public async findActiveVisit (userId: string): Promise<Visit> {
      return this.crud()
        .orWhere({ doctor: ObjectId(userId), state: VisitStatus.STARTED })
        .orWhere({ patient: ObjectId(userId), state: VisitStatus.STARTED })
        .populate(['doctor', 'patient'])
        .project({ __v: 0, conversations: 0 })
        .findOne();
    }

    public async getConversationsHistory (_id: string) {
      const visit = await this.crud().withId(_id).project({ conversations: 1 }).findOne();
      return visit ? visit.conversations.map(c => c.chat) : [];
    };

  public setDelivered = async (_id: string, chatId: string, userId: string) => {
    return this.crud().withId(_id).where({ 'conversations.chat.id': chatId })
      .set({ 'conversations.delivered': { $nin: [userId] } })
      .updateOne();
  };

  public async getDoctorQueueList (doctorId: string): Promise<Visit[]> {
    return this.crud()
      .where({ doctor: ObjectId(doctorId), state: VisitStatus.IN_QUEUE })
      .project({ _id: 1, patient: 1, createdAt: 1 })
      .populate(['patient'])
      .findMany();
  }

  public querySurveys (query: SearchQuery<Visit, {whiteList?: string[], doctorsWhitelist?: string[]}>) {
    const { skip, limit, populations, search, sort, doctorsWhitelist, whiteList, dateRange } = query;
    const condition = this.crud()
      .where({ rating: { $ne: undefined } })
      .whiteListFilter(whiteList);
    dateRange && condition.andWhere([{ createdAt: { $gte: smartDate(dateRange.from) } }, { createdAt: { $lte: smartDate(Number(dateRange.to)) } }]);
    doctorsWhitelist && doctorsWhitelist.length !== 0 && condition.andWhere({ doctor: { $in: doctorsWhitelist.map(i => i) } });
    return condition
      .project(query.projection || { _id: 1, rating: 1 })
      .populate(populations)
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .query();
  }

  public async query (query: SearchQuery<Visit, {
    userId?: string,
    targetId?: string,
    doctorsWhiteList?: string[]
    filters?:{
      moneyReturned?: 'true' | 'false',
      visitStatus?: VisitStatus,
      discount?: 'true' | 'false',
      visitsWhiteList?: string[]
    }
  }>): Promise<QueryResponse<Visit>> {
    const condition = this.crud();

    const { userId, targetId, filters, dateRange, doctorsWhiteList } = query;
    if (filters) {
      if (dateRange) {
        condition.andWhere({ createdAt: { $gte: Number(dateRange.from) } })
          .andWhere({ createdAt: { $lte: Number(dateRange.to) } });
      }
      if (filters.moneyReturned) {
        filters.moneyReturned === 'true' && condition.andWhere({ 'receipt.return_transaction_id': { $ne: null } });
        filters.moneyReturned === 'false' && condition.andWhere({ 'receipt.return_transaction_id': undefined });
      }
      if (filters.discount) {
        filters.discount === 'true' && condition.andWhere({ 'receipt.discount': { $gt: 0 } });
        filters.discount === 'false' && condition.andWhere({ 'receipt.discount': 0 });
      }
      filters.visitStatus && condition.andWhere({ state: filters.visitStatus });
    }

    if (doctorsWhiteList && doctorsWhiteList.length !== 0) {
      condition.andWhere({
        doctor: { $in: doctorsWhiteList.map(i => i) }
      });
    }

    if (isValidObjectId(userId)) {
      if (isValidObjectId(targetId)) {
        condition.orWhere({ patient: ObjectId(userId), doctor: ObjectId(targetId) });
        condition.orWhere({ doctor: ObjectId(targetId), patient: ObjectId(userId) });
      } else {
        condition.orWhere({ doctor: ObjectId(userId) });
        condition.orWhere({ patient: ObjectId(userId) });
      }
      if (filters && isValidObjectId(query.search)) {
        condition.andWhere({ _id: ObjectId(query.search) });
      }
    } else {
      if (filters && isValidObjectId(query.search)) {
        condition.orWhere({ _id: ObjectId(query.search) });
        condition.orWhere({ discount: ObjectId(query.search) });
        condition.orWhere({ doctor: ObjectId(query.search) });
        condition.orWhere({ patient: ObjectId(query.search) });
      } else if (filters && query.search && query.search !== '') {
        const users = await this.usersRepo.crud()
          .orWhere({ name: nameFilter(query.search) })
          .orWhere({ mobile: nameFilter(query.search) })
          .project({ _id: 1, type: 1 })
          .findMany();

        users.map((user) => {
          if (user.type === UserType.PATIENT) {
            return { patient: ObjectId(user._id) };
          } else {
            return { doctor: ObjectId(user._id) };
          }
        }).forEach((val) => {
          condition.orWhere(val);
        });
        // condition.$or = condition.$or || [];
        // condition.orWhere({ 'patient.mobile': search }, { 'doctor.mobile': search }, { 'doctor.name': search });
      }
    }

    console.log('condition', condition.getCondition());

    // handling allowedIds for privileges
    if (filters && filters.visitsWhiteList) {
      addWhiteListFilter(condition, filters.visitsWhiteList);
    }

    const uniqueQuery = await condition.clone().project({ patient: 1, doctor: 1 }).findMany();

    const uniquePatients = uniqueQuery
      .filter(v => Boolean(v.patient))
      .map(v => String(v.patient))
      .uniquify();

    const uniqueDoctors = uniqueQuery
      .filter(v => Boolean(v.doctor))
      .map(v => String(v.doctor))
      .uniquify();

    const res = await condition.project(query.projection || { __v: 0, conversations: 0 })
      .populate(query.populations || ['patient', 'doctor'])
      .skip(query.skip)
      .limit(query.limit)
      .sort(query.sort || { createdAt: -1 })
      .query();

    res.uniquePatients = uniquePatients.length;
    res.uniqueDoctors = uniqueDoctors.length;

    return res;
  }

  public crud () {
    return new VisitQueryBuilder(this.visitsDB, Visit);
  }
}

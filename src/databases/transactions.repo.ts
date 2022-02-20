import { Injectable } from '@nestjs/common';
import { InjectModel, SchemaFactory } from '@nestjs/mongoose';
import { QueryResponse, Transaction } from 'api';
import { Document, Model } from 'mongoose';
import QueryBuilder from './utils/query.builder';
import InternalServerError from '../errors/internal-server-error';
import { addWhiteListFilter, isValidObjectId, ObjectId } from './utils';

const mongoosePaginate = require('mongoose-paginate-v2');

class TransactionsQueryBuilder extends QueryBuilder<Transaction> {
  async create (data: Partial<Transaction>): Promise<Transaction> {
    if (data.visitId) {
      const duplicate = await this.where({ type: data.type, visitId: data.visitId })
        .findOne();
      if (duplicate) {
        throw new InternalServerError('duplicate transaction of type ' + data.type);
      }
    }
    return super.create(data);
  }
}

export type TransactionDocument = Transaction & Document;
export const TransactionSchema = SchemaFactory.createForClass(Transaction)
  .plugin(mongoosePaginate)
  .pre(['find', 'findOne', 'findOneAndUpdate'], function () {
    // should not be arrow function
    this.lean();
  });

@Injectable()
export default class TransactionsRepo {
  constructor (@InjectModel('transactions') private transactionsDB: Model<TransactionDocument>) {
  }

  public async query (userId: string, type: 'user' | 'healthcenter', fromDate: number = 0, toDate: number = Number.MAX_SAFE_INTEGER, skip: number, limit: number, projection: any, search: string | undefined, whiteList?: string[]): Promise<QueryResponse<Transaction>> {
    const condition = this.crud()
      .andWhere({ date: { $gte: fromDate } })
      .andWhere({ date: { $lte: toDate } });

    if (search && search !== '') {
      const $or = [{ trackingCode: search }, { visitId: search }];
      if (isValidObjectId(search)) {
        $or.push({ _id: ObjectId(search) } as any);
      }
      condition.andWhere({ $or });
    } else {
      condition
        .orWhere({ 'issuer._id': ObjectId(userId) })
        .orWhere({ 'target._id': ObjectId(userId) })
        .orWhere({ healthCenter: userId });
    }
    if (whiteList) {
      addWhiteListFilter(condition, whiteList);
    }
    return condition.skip(skip)
      .limit(limit)
      .project(projection)
      .sort({ date: -1 })
      .query();
  }

  public crud () {
    return new TransactionsQueryBuilder(this.transactionsDB, Transaction);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel, SchemaFactory } from '@nestjs/mongoose/';
import { Document, Model } from 'mongoose';
import { AbstractCallMetric, Conference } from 'api';
import QueryBuilder from './utils/query.builder';

const mongoosePaginate = require('mongoose-paginate-v2');

export type CallsDocument = Conference & Document;
export const CallSchema = SchemaFactory.createForClass(Conference)
  .plugin(mongoosePaginate)
  .pre(['find', 'findOne', 'findOneAndUpdate'], function () {
    // should not be arrow function
    this.lean();
  });

@Injectable()
export default class CallsRepo {
  constructor (@InjectModel('calls') private callsDB: Model<CallsDocument>) {}

  public async addCallMetric (metric: AbstractCallMetric<any>) {
    await this.crud().where({ id: metric.sessionId })
      .addToSet({ events: metric })
      .updateOne();
  };

  public crud () {
    return new QueryBuilder<Conference>(this.callsDB, Conference);
  }
}

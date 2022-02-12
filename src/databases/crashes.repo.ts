import { Injectable } from '@nestjs/common';
import { InjectModel, SchemaFactory } from '@nestjs/mongoose/';
import { Document, Model } from 'mongoose';
import { CrashReport } from 'api';
import QueryBuilder from './utils/query.builder';

const mongoosePaginate = require('mongoose-paginate-v2');

export type CrashDocument = CrashReport & Document;
export const CrashSchema = SchemaFactory.createForClass(CrashReport)
  .plugin(mongoosePaginate)
  .pre(['find', 'findOne', 'findOneAndUpdate'], function () {
    // should not be arrow function
    this.lean();
  });

@Injectable()
export default class CrashesRepo {
  constructor (@InjectModel('crashes') private crashesDB: Model<CrashDocument>) {}

  public crud () {
    return new QueryBuilder<CrashReport>(this.crashesDB, CrashReport);
  }
}

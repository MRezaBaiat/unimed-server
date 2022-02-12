import { Injectable } from '@nestjs/common';
import { InjectModel, SchemaFactory } from '@nestjs/mongoose/';
import { Document, Model } from 'mongoose';
import { AdminLog } from 'api';
import QueryBuilder from './utils/query.builder';

const mongoosePaginate = require('mongoose-paginate-v2');

export type AdminLogDocument = AdminLog & Document;
export const AdminLogSchema = SchemaFactory.createForClass(AdminLog)
  .plugin(mongoosePaginate)
  .pre(['find', 'findOne', 'findOneAndUpdate'], function () {
    // should not be arrow function
    this.lean();
  });

@Injectable()
export default class AdminLogsRepo {
  constructor (@InjectModel('admin-logs') private adminLogsDB: Model<AdminLogDocument>) {}

  public crud () {
    return new QueryBuilder<AdminLog>(this.adminLogsDB, AdminLog);
  }
}

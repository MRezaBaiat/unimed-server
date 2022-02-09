import { Injectable } from '@nestjs/common';
import { InjectModel, SchemaFactory } from '@nestjs/mongoose/';
import { Document, Model } from 'mongoose';
import { Notification } from 'matap-api';
import QueryBuilder from './utils/query.builder';

const mongoosePaginate = require('mongoose-paginate-v2');

export type NotificationDocument = Notification & Document;
export const NotificationSchema = SchemaFactory.createForClass(Notification)
  .plugin(mongoosePaginate)
  .pre(['find', 'findOne', 'findOneAndUpdate'], function () {
    // should not be arrow function
    // @ts-ignore
    this.lean();
  });

@Injectable()
export default class NotificationsRepo {
  constructor (@InjectModel('notifications') private notificationsDB: Model<NotificationDocument>) {}

  public crud () {
    return new QueryBuilder<Notification>(this.notificationsDB, Notification);
  }
}

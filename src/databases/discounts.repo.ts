import { Injectable } from '@nestjs/common';
import { InjectModel, SchemaFactory } from '@nestjs/mongoose/';
import { Document, Model } from 'mongoose';
import { DiscountCoupon } from 'api';
import QueryBuilder from './utils/query.builder';

const mongoosePaginate = require('mongoose-paginate-v2');

export type DiscountDocument = DiscountCoupon & Document;
export const DiscountSchema = SchemaFactory.createForClass(DiscountCoupon)
  .plugin(mongoosePaginate)
  .pre(['find', 'findOne', 'findOneAndUpdate'], function () {
    // should not be arrow function
    this.lean();
  });

@Injectable()
export default class DiscountsRepo {
  constructor (@InjectModel('discount_coupons') private discountsDB: Model<DiscountDocument>) {}

  public async couponUsedBy (couponId: string, userId: string) {
    return this.crud().withId(couponId).push({ usages: String(userId) }).updateOne();
  }

  public crud () {
    return new QueryBuilder<DiscountCoupon>(this.discountsDB, DiscountCoupon);
  }
}

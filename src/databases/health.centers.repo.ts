import { Injectable } from '@nestjs/common';
import { InjectModel, SchemaFactory } from '@nestjs/mongoose/';
import { Document, Model } from 'mongoose';
import { HealthCenter, QueryResponse } from 'matap-api';
import QueryBuilder from './utils/query.builder';
import {addWhiteListFilter, isValidObjectId, nameFilter, ObjectId} from './utils';

const mongoosePaginate = require('mongoose-paginate-v2');

export type HealthCentersDocument = HealthCenter & Document;
export const HealthCentersSchema = SchemaFactory.createForClass(HealthCenter)
  .plugin(mongoosePaginate)
  .pre(['find', 'findOne', 'findOneAndUpdate'], function () {
    // should not be arrow function
    // @ts-ignore
    this.lean();
  });

@Injectable()
export default class HealthCentersRepo {
  constructor (@InjectModel('healthcenters') private healthCentersDB: Model<HealthCentersDocument>) {}

  public async query (skip: number, limit: number, search: string, whiteList?: string[]): Promise<QueryResponse<HealthCenter>> {
    const condition = this.crud();
    if (search && search !== '') {
      condition.orWhere({ name: nameFilter(search) });
      if (isValidObjectId(search)) {
        condition.orWhere({ _id: ObjectId(search) });
      }
    }
    if (whiteList) {
      addWhiteListFilter(condition, whiteList);
    }
    return condition
      .skip(skip)
      .limit(limit)
      .query();
  }

  public crud () {
    return new QueryBuilder<HealthCenter>(this.healthCentersDB, HealthCenter);
  }
}

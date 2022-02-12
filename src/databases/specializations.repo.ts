import { Injectable } from '@nestjs/common';
import { InjectModel, SchemaFactory } from '@nestjs/mongoose/';
import { Document, Model } from 'mongoose';
import { QueryResponse, Specialization } from 'api';
import QueryBuilder from './utils/query.builder';
import SearchQuery from './utils/search.query';
import { addWhiteListFilter } from './utils';

const mongoosePaginate = require('mongoose-paginate-v2');

export type SpecializationDocument = Specialization & Document;
export const SpecializationSchema = SchemaFactory.createForClass(Specialization)
  .plugin(mongoosePaginate)
  .pre(['find', 'findOne', 'findOneAndUpdate'], function () {
    // should not be arrow function
    this.lean();
  });

@Injectable()
export default class SpecializationsRepo {
  constructor (@InjectModel('specializations') private specializationDB: Model<SpecializationDocument>) {}

  public async query (query: SearchQuery<Specialization, { whiteList: string[] }>): Promise<QueryResponse<Specialization>> {
    const { skip, limit, projection, populations, search, whiteList } = query;

    const condition = this.crud();
    search && condition.whereTextLike({ name: search }, 'or')
      .searchId({ _id: search }, 'or');

    whiteList && addWhiteListFilter(condition, whiteList);
    return condition
      .project(projection || { __v: 0 })
      .populate(populations)
      .skip(skip)
      .limit(limit)
      .query();
  }

  public crud () {
    return new QueryBuilder<Specialization>(this.specializationDB, Specialization);
  }
}

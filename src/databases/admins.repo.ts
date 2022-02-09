// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { InjectModel, SchemaFactory } from '@nestjs/mongoose/';
import { Document, Model } from 'mongoose';
import { Admin, QueryResponse } from 'matap-api';
import QueryBuilder from './utils/query.builder';
import SearchQuery from './utils/search.query';

const mongoosePaginate = require('mongoose-paginate-v2');

export type AdminsDocument = Admin & Document;
export const AdminsSchema = SchemaFactory.createForClass(Admin)
  .plugin(mongoosePaginate)
  .pre(['find', 'findOne', 'findOneAndUpdate'], function () {
    // should not be arrow function
    // @ts-ignore
    this.lean();
  });

@Injectable()
export default class AdminsRepo {
  constructor (@InjectModel('admins') private adminsDB: Model<AdminsDocument>) {}

  public async query (query: SearchQuery<Admin, {whiteList?: string[]}>): Promise<QueryResponse<Admin>> {
    const { search, skip, sort, limit, populations, projection, whiteList } = query;
    const condition = this.crud()
      .whereTextLike({ name: search, username: search }, 'or')
      .searchId({ _id: search }, 'or')
      .whiteListFilter(whiteList);

    return condition
      .project(projection || { name: 1, _id: 1, type: 1 })
      .populate(populations)
      .limit(limit)
      .skip(skip)
      .sort(sort)
      .query();
  }

  public crud () {
    return new QueryBuilder<Admin>(this.adminsDB, Admin);
  }
}

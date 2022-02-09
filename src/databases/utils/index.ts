import mongoose from 'mongoose';
import { DataQueryBuilder } from './data.query.builder';

export const ObjectId = require('mongoose').Types.ObjectId;

export function nameFilter (filter: any) {
  return { $regex: filter, $options: 'i' };
}

export function isValidObjectId (id: any) {
  return id && mongoose.isValidObjectId(id);
}

export function addWhiteListFilter (query: DataQueryBuilder<any>, whiteList?: string[]) {
  if (whiteList && whiteList.length !== 0) {
    query.andWhere({ _id: { $in: whiteList.map(i => { return { _id: i }; }) } });
  }
}

export function generateQueryResponse (total, results, skip, limit) {
  return {
    total,
    results,
    currentPageIndex: (skip / limit),
    maxPageIndex: Math.floor((total + limit - 1) / limit) - 1
  };
}

export function arrayIncludes (what: any) {
  return { $in: what };
}

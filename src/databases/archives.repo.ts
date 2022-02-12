import { Injectable } from '@nestjs/common';
import { InjectModel, SchemaFactory } from '@nestjs/mongoose/';
import { Document, Model } from 'mongoose';
import { Archive } from 'api';
import QueryBuilder from './utils/query.builder';

const mongoosePaginate = require('mongoose-paginate-v2');

export type ArchiveDocument = Archive & Document;
export const ArchiveSchema = SchemaFactory.createForClass(Archive)
  .plugin(mongoosePaginate)
  .pre(['find', 'findOne', 'findOneAndUpdate'], function () {
    // should not be arrow function
    this.lean();
  });

@Injectable()
export default class ArchivesRepo {
  constructor (@InjectModel('archives') private archivesDB: Model<ArchiveDocument>) {}

  public crud () {
    return new QueryBuilder<Archive>(this.archivesDB, Archive);
  }
}

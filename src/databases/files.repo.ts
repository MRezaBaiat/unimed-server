import { Injectable } from '@nestjs/common';
import { InjectModel, SchemaFactory } from '@nestjs/mongoose/';
import { Document, Model } from 'mongoose';
import { FileInfo } from 'matap-api';
import QueryBuilder from './utils/query.builder';

const mongoosePaginate = require('mongoose-paginate-v2');

export type FileInfoDocument = FileInfo & Document;
export const FileInfoSchema = SchemaFactory.createForClass(FileInfo)
  .plugin(mongoosePaginate)
  .pre(['find', 'findOne', 'findOneAndUpdate'], function () {
    // should not be arrow function
    // @ts-ignore
    this.lean();
  });

@Injectable()
export default class FilesRepo {
  constructor (@InjectModel('fs.files') private fileInfoDB: Model<FileInfoDocument>) {}

  public crud () {
    return new QueryBuilder<FileInfo>(this.fileInfoDB, FileInfo);
  }
}

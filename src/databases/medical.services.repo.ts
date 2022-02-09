import { Injectable } from '@nestjs/common';
import { InjectModel, SchemaFactory } from '@nestjs/mongoose/';
import { Document, Model } from 'mongoose';
import { MedicalService } from 'matap-api';
import QueryBuilder from './utils/query.builder';

const mongoosePaginate = require('mongoose-paginate-v2');

export type MedicalServicesDocument = MedicalService & Document;
export const MedicalServicesSchema = SchemaFactory.createForClass(MedicalService)
  .plugin(mongoosePaginate)
  .pre(['find', 'findOne', 'findOneAndUpdate'], function () {
    // should not be arrow function
    // @ts-ignore
    this.lean();
  });

@Injectable()
export default class MedicalServicesRepo {
  constructor (@InjectModel('medical_services') private medicalServicesDB: Model<MedicalServicesDocument>) {}

  public crud () {
    return new QueryBuilder<MedicalService>(this.medicalServicesDB, MedicalService);
  }
}

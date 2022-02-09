import { Injectable } from '@nestjs/common';
import { InjectModel, SchemaFactory } from '@nestjs/mongoose/';
import { Document, Model } from 'mongoose';
import { ServiceRequest } from 'matap-api';
import QueryBuilder from './utils/query.builder';

const mongoosePaginate = require('mongoose-paginate-v2');

class ServiceRequestsQueryBuilder extends QueryBuilder<ServiceRequest> {
  public setSeen = (id: string) => {
    return this.withId(id)
      .whereTextLike({ status: 'NOT_SEEN' })
      .set({ status: 'CHECKING' })
      .updateOne();
  }
}

export type ServiceRequestsDocument = ServiceRequest & Document;
export const ServiceRequestsSchema = SchemaFactory.createForClass(ServiceRequest)
  .plugin(mongoosePaginate)
  .pre(['find', 'findOne', 'findOneAndUpdate'], function () {
    // should not be arrow function
    // @ts-ignore
    this.lean();
  });

@Injectable()
export default class ServiceRequestsRepo {
  constructor (@InjectModel('service_requests') private serviceRequestsDB: Model<ServiceRequestsDocument>) {}

  public crud () {
    return new ServiceRequestsQueryBuilder(this.serviceRequestsDB, ServiceRequest);
  }
}

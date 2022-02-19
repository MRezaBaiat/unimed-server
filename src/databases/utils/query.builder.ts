import 'reflect-metadata';
import { plainToInstance, plainToClassFromExist } from 'class-transformer';
import mongoose, { Query, QueryWithHelpers, UpdateWriteOpResult, Model } from 'mongoose';
import { DataQueryBuilder } from './data.query.builder';
import { ObjectId } from './index';

export default class QueryBuilder<M> extends DataQueryBuilder<M> {
  private metatype: any;
  private db: Model<any>;
  constructor (db, metatype) {
    super();
    this.db = db;
    this.metatype = metatype;
  }

  clone (modifier?: (value: this) => void): this {
    const c = super.clone(modifier);
    c.metatype = this.metatype;
    c.db = this.db;
    return c;
  }

  async findMany (): Promise<M[] | undefined> {
    const query = this.getQuery();
    const res = await this.db
      .find(query.condition, query.projection || { __v: 0 })
      .sort(query.sort)
      .populate(query.populations)
      .skip(<number>query.skip)
      .limit(<number>query.limit);

    if (res) {
      res.map((r) => {
        this.convertIdFields(r);
        return r;
      });
    }
    return res;
  }

  private convertIdFields = (object: any) => {
    if (!object) {
      return;
    }
    Object.keys(object).forEach((key) => {
      if (key === '_id') {
        object[key] = String(object[key]);
      } else if (typeof object[key] === 'object') {
        this.convertIdFields(object[key]);
      }
    });
  };

  async findOne (cast = false): Promise<M | undefined> {
    const query = this.getQuery();
    let res = await this.db
      .findOne(query.condition, query.projection || { __v: 0 })
      .sort(query.sort)
      .populate(query.populations);

    res && this.convertIdFields(res);
    /* if (res && res._id) {
      res._id = String(res._id);
    } */
    if (res && cast) {
      res = plainToInstance(this.metatype, res);
    }
    return res;
  }

  async query () {
    const query = this.getQuery();
    query.projection = query.projection || {};
    query.skip = query.skip || 0;
    query.limit = query.limit || 50;
    const { skip, limit, projection, populations, sort } = query;
    const { db } = this;
    // @ts-ignore
    const options: mongoose.PaginateOptions = {
      projection: projection,
      populate: populations,
      limit: limit,
      offset: skip,
      sort: sort,
      lean: true, // Should return plain javascript objects instead of Mongoose documents
      pagination: true,
      leanWithId: false
    };

    return (
      db
      // @ts-ignore
        .paginate(query.condition, options)
        .then((res) => {
          return {
            total: res.totalDocs,
            currentPageIndex: skip / limit,
            maxPageIndex: Math.floor((res.totalDocs + limit - 1) / limit) - 1,
            results: res.docs
          };
        })
        .then((res) => {
          res.results && res.results.map((obj) => {
            this.convertIdFields(obj);
            return obj;
          });
          return res;
        })
    );
  }

  updateMany (): QueryWithHelpers<UpdateWriteOpResult, any> {
    return this.db.updateMany(this.getCondition(), this.getUpdates());
  }

  updateOne (): QueryWithHelpers<UpdateWriteOpResult, any> {
    return this.db.updateOne(this.getCondition(), this.getUpdates());
  }

  async patch (): Promise<boolean> {
    const id = this.getId();
    if (!id) {
      throw new Error('id must be provided when using patch');
    }
    return (
      (await this.db.updateOne({ _id: ObjectId(id) }, this.getUpdates()).exec())
        .modifiedCount === 1
    );
  }

  async deleteOne (): Promise<{ n: number; deletedCount: number; ok: number }> {
    return this.db.deleteOne(this.getCondition()) as any;
  }

  async deleteMany (): Promise<{ n: number; deletedCount: number; ok: number }> {
    return this.db.deleteMany(this.getCondition()) as any;
  }

  create (data: Partial<M>): Promise<M> {
    return new Promise((resolve, reject) => {
      this.db.create(data, (err, data) => {
        if (err) {
          return reject(err);
        }
        const obj = data.toObject();
        obj._id = String(obj._id);
        resolve(obj);
      });
    });
  }
}

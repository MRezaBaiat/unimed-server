"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const class_transformer_1 = require("class-transformer");
const data_query_builder_1 = require("./data.query.builder");
const index_1 = require("./index");
class QueryBuilder extends data_query_builder_1.DataQueryBuilder {
    constructor(db, metatype) {
        super();
        this.convertIdFields = (object) => {
            if (!object) {
                return;
            }
            Object.keys(object).forEach((key) => {
                if (key === '_id') {
                    object[key] = String(object[key]);
                }
                else if (typeof object[key] === 'object') {
                    this.convertIdFields(object[key]);
                }
            });
        };
        this.db = db;
        this.metatype = metatype;
    }
    clone(modifier) {
        const c = super.clone(modifier);
        c.metatype = this.metatype;
        c.db = this.db;
        return c;
    }
    findMany() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = this.getQuery();
            const res = yield this.db
                .find(query.condition, query.projection || { __v: 0 })
                .sort(query.sort)
                .populate(query.populations)
                .skip(query.skip)
                .limit(query.limit);
            if (res) {
                res.map((r) => {
                    this.convertIdFields(r);
                    return r;
                });
            }
            return res;
        });
    }
    findOne(cast = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = this.getQuery();
            let res = yield this.db
                .findOne(query.condition, query.projection || { __v: 0 })
                .sort(query.sort)
                .populate(query.populations);
            res && this.convertIdFields(res);
            if (res && cast) {
                res = (0, class_transformer_1.plainToInstance)(this.metatype, res);
            }
            return res;
        });
    }
    query() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = this.getQuery();
            query.projection = query.projection || {};
            query.skip = query.skip || 0;
            query.limit = query.limit || 50;
            const { skip, limit, projection, populations, sort } = query;
            const { db } = this;
            const options = {
                projection: projection,
                populate: populations,
                limit: limit,
                offset: skip,
                sort: sort,
                lean: true,
                pagination: true,
                leanWithId: false
            };
            return (db
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
            }));
        });
    }
    updateMany() {
        return this.db.updateMany(this.getCondition(), this.getUpdates());
    }
    updateOne() {
        return this.db.updateOne(this.getCondition(), this.getUpdates());
    }
    patch() {
        return __awaiter(this, void 0, void 0, function* () {
            const id = this.getId();
            if (!id) {
                throw new Error('id must be provided when using patch');
            }
            return ((yield this.db.updateOne({ _id: (0, index_1.ObjectId)(id) }, this.getUpdates()).exec())
                .modifiedCount === 1);
        });
    }
    deleteOne() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.deleteOne(this.getCondition());
        });
    }
    deleteMany() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.deleteMany(this.getCondition());
        });
    }
    create(data) {
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
exports.default = QueryBuilder;

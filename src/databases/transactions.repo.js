"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionSchema = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const api_1 = require("api");
const mongoose_2 = require("mongoose");
const query_builder_1 = __importDefault(require("./utils/query.builder"));
const internal_server_error_1 = __importDefault(require("../errors/internal-server-error"));
const utils_1 = require("./utils");
const mongoosePaginate = require('mongoose-paginate-v2');
class TransactionsQueryBuilder extends query_builder_1.default {
    create(data) {
        const _super = Object.create(null, {
            create: { get: () => super.create }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (data.visitId) {
                const duplicate = yield this.where({ type: data.type, visit_id: data.visitId })
                    .findOne();
                if (duplicate) {
                    throw new internal_server_error_1.default('duplicate transaction of type ' + data.type);
                }
            }
            return _super.create.call(this, data);
        });
    }
}
exports.TransactionSchema = mongoose_1.SchemaFactory.createForClass(api_1.Transaction)
    .plugin(mongoosePaginate)
    .pre(['find', 'findOne', 'findOneAndUpdate'], function () {
    this.lean();
});
let TransactionsRepo = class TransactionsRepo {
    constructor(transactionsDB) {
        this.transactionsDB = transactionsDB;
    }
    query(userId, type, fromDate = 0, toDate = Number.MAX_SAFE_INTEGER, skip, limit, projection, search, whiteList) {
        return __awaiter(this, void 0, void 0, function* () {
            const condition = this.crud()
                .andWhere({ date: { $gte: fromDate } })
                .andWhere({ date: { $lte: toDate } });
            if (search && search !== '') {
                const $or = [{ tracking_code: search }, { visit_id: search }];
                if ((0, utils_1.isValidObjectId)(search)) {
                    $or.push({ _id: (0, utils_1.ObjectId)(search) });
                }
                condition.andWhere({ $or });
            }
            else {
                condition
                    .orWhere({ 'issuer._id': (0, utils_1.ObjectId)(userId) })
                    .orWhere({ 'target._id': (0, utils_1.ObjectId)(userId) })
                    .orWhere({ healthCenter: userId });
            }
            if (whiteList) {
                (0, utils_1.addWhiteListFilter)(condition, whiteList);
            }
            return condition.skip(skip)
                .limit(limit)
                .project(projection)
                .sort({ date: -1 })
                .query();
        });
    }
    crud() {
        return new TransactionsQueryBuilder(this.transactionsDB, api_1.Transaction);
    }
};
TransactionsRepo = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('transactions')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], TransactionsRepo);
exports.default = TransactionsRepo;

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
exports.VisitSchema = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const api_1 = require("api");
const mongoose_2 = require("mongoose");
const query_builder_1 = __importDefault(require("./utils/query.builder"));
const utils_1 = require("./utils");
const users_repo_1 = __importDefault(require("./users.repo"));
const javascript_dev_kit_1 = require("javascript-dev-kit/");
const mongoosePaginate = require('mongoose-paginate-v2');
class VisitQueryBuilder extends query_builder_1.default {
    findOne(cast = false) {
        const _super = Object.create(null, {
            findOne: { get: () => super.findOne }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (this._populations && this._populations.includes('doctor')) {
                this._populations[this._populations.indexOf('doctor')] = { path: 'doctor', populate: { path: 'specialization', model: 'specializations' } };
            }
            return _super.findOne.call(this, cast);
        });
    }
    findMany() {
        const _super = Object.create(null, {
            findMany: { get: () => super.findMany }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (this._populations && this._populations.includes('doctor')) {
                this._populations[this._populations.indexOf('doctor')] = { path: 'doctor', populate: { path: 'specialization', model: 'specializations' } };
            }
            return _super.findMany.call(this);
        });
    }
}
exports.VisitSchema = mongoose_1.SchemaFactory.createForClass(api_1.Visit)
    .plugin(mongoosePaginate)
    .pre(['find', 'findOne', 'findOneAndUpdate'], function () {
    this.lean();
});
let VisitsRepo = class VisitsRepo {
    constructor(visitsDB, usersRepo) {
        this.visitsDB = visitsDB;
        this.usersRepo = usersRepo;
        this.addChat = (_id, chat, delivered, senderUserType) => __awaiter(this, void 0, void 0, function* () {
            if (senderUserType === api_1.UserType.PATIENT) {
                return this.crud()
                    .withId(_id)
                    .push({ conversations: { chat, delivered } })
                    .set({ chatting: true })
                    .updateOne();
            }
            else {
                return this.crud()
                    .withId(_id)
                    .push({ conversations: { chat, delivered } })
                    .updateOne();
            }
        });
        this.setDelivered = (_id, chatId, userId) => __awaiter(this, void 0, void 0, function* () {
            return this.crud().withId(_id).where({ 'conversations.chat.id': chatId })
                .set({ 'conversations.delivered': { $nin: [userId] } })
                .updateOne();
        });
    }
    findPatienceQueue(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.crud()
                .where({ patient: (0, utils_1.ObjectId)(userId), state: api_1.VisitStatus.IN_QUEUE })
                .project({ __v: 0, conversations: 0 })
                .populate(['doctor', 'patient'])
                .findOne();
        });
    }
    findUserFinalizationsList(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.usersRepo.crud()
                .withId(userId)
                .project({ finalizable_visits: 1 })
                .findOne();
            if (!user) {
                return undefined;
            }
            const list = [];
            for (const id of user.finalizableVisits) {
                const visit = yield this.crud()
                    .withId(id)
                    .project({ __v: 0, conversations: 0 })
                    .populate(['doctor', 'patient'])
                    .findOne();
                visit && list.push(visit);
            }
            return list;
        });
    }
    ;
    findActiveVisit(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.crud()
                .orWhere({ doctor: (0, utils_1.ObjectId)(userId), state: api_1.VisitStatus.STARTED })
                .orWhere({ patient: (0, utils_1.ObjectId)(userId), state: api_1.VisitStatus.STARTED })
                .populate(['doctor', 'patient'])
                .project({ __v: 0, conversations: 0 })
                .findOne();
        });
    }
    getConversationsHistory(_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const visit = yield this.crud().withId(_id).project({ conversations: 1 }).findOne();
            return visit ? visit.conversations.map(c => c.chat) : [];
        });
    }
    ;
    getDoctorQueueList(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.crud()
                .where({ doctor: (0, utils_1.ObjectId)(doctorId), state: api_1.VisitStatus.IN_QUEUE })
                .project({ _id: 1, patient: 1, createdAt: 1 })
                .populate(['patient'])
                .findMany();
        });
    }
    querySurveys(query) {
        const { skip, limit, populations, search, sort, doctorsWhitelist, whiteList, dateRange } = query;
        const condition = this.crud()
            .where({ rating: { $ne: undefined } })
            .whiteListFilter(whiteList);
        dateRange && condition.andWhere([{ createdAt: { $gte: (0, javascript_dev_kit_1.smartDate)(dateRange.from) } }, { createdAt: { $lte: (0, javascript_dev_kit_1.smartDate)(Number(dateRange.to)) } }]);
        doctorsWhitelist && doctorsWhitelist.length !== 0 && condition.andWhere({ doctor: { $in: doctorsWhitelist.map(i => i) } });
        return condition
            .project(query.projection || { _id: 1, rating: 1 })
            .populate(populations)
            .skip(skip)
            .limit(limit)
            .sort(sort)
            .query();
    }
    query(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const condition = this.crud();
            const { userId, targetId, filters, dateRange, doctorsWhiteList } = query;
            if (filters) {
                if (dateRange) {
                    condition.andWhere({ createdAt: { $gte: Number(dateRange.from) } })
                        .andWhere({ createdAt: { $lte: Number(dateRange.to) } });
                }
                if (filters.moneyReturned) {
                    filters.moneyReturned === 'true' && condition.andWhere({ 'receipt.return_transaction_id': { $ne: null } });
                    filters.moneyReturned === 'false' && condition.andWhere({ 'receipt.return_transaction_id': undefined });
                }
                if (filters.discount) {
                    filters.discount === 'true' && condition.andWhere({ 'receipt.discount': { $gt: 0 } });
                    filters.discount === 'false' && condition.andWhere({ 'receipt.discount': 0 });
                }
                filters.visitStatus && condition.andWhere({ state: filters.visitStatus });
            }
            if (doctorsWhiteList && doctorsWhiteList.length !== 0) {
                condition.andWhere({
                    doctor: { $in: doctorsWhiteList.map(i => i) }
                });
            }
            if ((0, utils_1.isValidObjectId)(userId)) {
                if ((0, utils_1.isValidObjectId)(targetId)) {
                    condition.orWhere({ patient: (0, utils_1.ObjectId)(userId), doctor: (0, utils_1.ObjectId)(targetId) });
                    condition.orWhere({ doctor: (0, utils_1.ObjectId)(targetId), patient: (0, utils_1.ObjectId)(userId) });
                }
                else {
                    condition.orWhere({ doctor: (0, utils_1.ObjectId)(userId) });
                    condition.orWhere({ patient: (0, utils_1.ObjectId)(userId) });
                }
                if (filters && (0, utils_1.isValidObjectId)(query.search)) {
                    condition.andWhere({ _id: (0, utils_1.ObjectId)(query.search) });
                }
            }
            else {
                if (filters && (0, utils_1.isValidObjectId)(query.search)) {
                    condition.orWhere({ _id: (0, utils_1.ObjectId)(query.search) });
                    condition.orWhere({ discount: (0, utils_1.ObjectId)(query.search) });
                    condition.orWhere({ doctor: (0, utils_1.ObjectId)(query.search) });
                    condition.orWhere({ patient: (0, utils_1.ObjectId)(query.search) });
                }
                else if (filters && query.search && query.search !== '') {
                    const users = yield this.usersRepo.crud()
                        .orWhere({ name: (0, utils_1.nameFilter)(query.search) })
                        .orWhere({ mobile: (0, utils_1.nameFilter)(query.search) })
                        .project({ _id: 1, type: 1 })
                        .findMany();
                    users.map((user) => {
                        if (user.type === api_1.UserType.PATIENT) {
                            return { patient: (0, utils_1.ObjectId)(user._id) };
                        }
                        else {
                            return { doctor: (0, utils_1.ObjectId)(user._id) };
                        }
                    }).forEach((val) => {
                        condition.orWhere(val);
                    });
                }
            }
            console.log('condition', condition.getCondition());
            if (filters && filters.visitsWhiteList) {
                (0, utils_1.addWhiteListFilter)(condition, filters.visitsWhiteList);
            }
            const uniqueQuery = yield condition.clone().project({ patient: 1, doctor: 1 }).findMany();
            const uniquePatients = uniqueQuery
                .filter(v => Boolean(v.patient))
                .map(v => String(v.patient))
                .uniquify();
            const uniqueDoctors = uniqueQuery
                .filter(v => Boolean(v.doctor))
                .map(v => String(v.doctor))
                .uniquify();
            const res = yield condition.project(query.projection || { __v: 0, conversations: 0 })
                .populate(query.populations || ['patient', 'doctor'])
                .skip(query.skip)
                .limit(query.limit)
                .sort(query.sort || { createdAt: -1 })
                .query();
            res.uniquePatients = uniquePatients.length;
            res.uniqueDoctors = uniqueDoctors.length;
            return res;
        });
    }
    crud() {
        return new VisitQueryBuilder(this.visitsDB, api_1.Visit);
    }
};
VisitsRepo = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('visits')),
    __metadata("design:paramtypes", [mongoose_2.Model, users_repo_1.default])
], VisitsRepo);
exports.default = VisitsRepo;

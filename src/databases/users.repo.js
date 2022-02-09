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
exports.UserSchema = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const matap_api_1 = require("matap-api");
const mongoose_2 = require("mongoose");
const query_builder_1 = __importDefault(require("./utils/query.builder"));
const mongoosePaginate = require('mongoose-paginate-v2');
const pops = [
    { path: 'details.response_days.0.healthCenter', model: 'healthcenters' },
    { path: 'details.response_days.1.healthCenter', model: 'healthcenters' },
    { path: 'details.response_days.2.healthCenter', model: 'healthcenters' },
    { path: 'details.response_days.3.healthCenter', model: 'healthcenters' },
    { path: 'details.response_days.4.healthCenter', model: 'healthcenters' },
    { path: 'details.response_days.5.healthCenter', model: 'healthcenters' },
    { path: 'details.response_days.6.healthCenter', model: 'healthcenters' }
];
class UserQueryBuilder extends query_builder_1.default {
    findOne(cast = false) {
        const _super = Object.create(null, {
            findOne: { get: () => super.findOne }
        });
        return __awaiter(this, void 0, void 0, function* () {
            this.populate([...pops, { path: 'details.hospitals', model: 'healthcenters' }, { path: 'details.clinics', model: 'healthcenters' }, 'specialization']);
            return _super.findOne.call(this, cast);
        });
    }
    findMany() {
        const _super = Object.create(null, {
            findMany: { get: () => super.findMany }
        });
        return __awaiter(this, void 0, void 0, function* () {
            this.populate([...pops, { path: 'details.hospitals', model: 'healthcenters' }, { path: 'details.clinics', model: 'healthcenters' }, 'specialization']);
            return _super.findMany.call(this);
        });
    }
}
exports.UserSchema = mongoose_1.SchemaFactory.createForClass(matap_api_1.User)
    .plugin(mongoosePaginate)
    .pre(['find', 'findOne', 'findOneAndUpdate'], function () {
    this.lean();
});
let UsersRepo = class UsersRepo {
    constructor(usersDB) {
        this.usersDB = usersDB;
        this.setReadyState = (userId, ready) => __awaiter(this, void 0, void 0, function* () {
            return this.crud().withId(userId)
                .set({ ready })
                .updateOne();
        });
        this.setPatientCurrency = (userId, currency) => __awaiter(this, void 0, void 0, function* () {
            return this.crud().withId(userId)
                .set({ currency })
                .updateOne();
        });
        this.addWaitingForFinalization = (userId, visitId) => __awaiter(this, void 0, void 0, function* () {
            return this.crud().withId(userId)
                .push({ finalizable_visits: String(visitId) })
                .updateOne();
        });
        this.removeWaitingForFinalization = (userId, visitId) => __awaiter(this, void 0, void 0, function* () {
            return this.crud().withId(userId)
                .pull({ finalizable_visits: String(visitId) })
                .updateOne();
        });
    }
    isDoctorReady(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.crud().withId(userId)
                .project({ ready: 1 })
                .findOne())
                .ready;
        });
    }
    addPatientToNotificationQueue(doctorId, patientId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.crud().withId(doctorId)
                .push({ notificationQueuePatients: patientId })
                .updateOne();
        });
    }
    query(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { skip, limit, sort, populations, projection, type, search, onlyVisibleDoctors, whiteList, searchByMobile } = query;
            const condition = this.crud().where(type ? { type } : {})
                .whiteListFilter(whiteList);
            onlyVisibleDoctors && condition.andWhere({ 'details.displayInList': true });
            if (search && search !== '') {
                condition.whereTextLike({ name: search }, 'or')
                    .searchId({ _id: search }, 'or');
                if (searchByMobile) {
                    condition.whereTextLike({ mobile: search }, 'or');
                }
                !isNaN(search) && condition.orWhere({ code: Number(search) });
            }
            return condition
                .project(projection || { _id: 1, name: 1, creationDate: 1, mobile: 1, ready: 1, type: 1, imageUrl: 1, code: 1, 'details.response_days': 1, specialization: 1, price: 1 })
                .populate(populations || ['specialization'])
                .sort(sort || { creationDate: -1 })
                .skip(skip)
                .limit(limit)
                .query();
        });
    }
    getDoctorCurrentResponseTime(id, fromOffset = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            const doctor = yield this.crud().withId(id)
                .where({ type: matap_api_1.UserType.DOCTOR })
                .project({ 'details.response_days': 1 })
                .findOne();
            const { response_days } = doctor.details;
            const now = new Date();
            const nowTime = now.getTime();
            const day = now.getDay();
            let time;
            response_days[String(day)].map((responseTime) => {
                const fromDate = new Date();
                const toDate = new Date();
                fromDate.setHours(Number(responseTime.from.hour), Number(responseTime.from.minute), 0, 0);
                toDate.setHours(Number(responseTime.to.hour), Number(responseTime.to.minute), 0, 0);
                if (fromOffset === 0) {
                    if (nowTime >= fromDate.getTime() && nowTime < toDate.getTime()) {
                        time = responseTime;
                    }
                }
                else {
                    if (fromDate.getTime() - nowTime <= fromOffset && nowTime < toDate.getTime()) {
                        time = responseTime;
                        time.diff = fromDate.getTime() - nowTime;
                    }
                }
            });
            return time;
        });
    }
    removePatientOfNotificationQueue(doctorId, patientId) {
        return this.crud().withId(doctorId)
            .pull({ notificationQueuePatients: patientId })
            .updateOne();
    }
    crud() {
        return new UserQueryBuilder(this.usersDB, matap_api_1.User);
    }
};
UsersRepo = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('users')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UsersRepo);
exports.default = UsersRepo;

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
exports.ReservationsSchema = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose/");
const mongoose_2 = require("mongoose");
const matap_api_1 = require("matap-api");
const query_builder_1 = __importDefault(require("./utils/query.builder"));
const utils_1 = require("./utils");
const mongoosePaginate = require('mongoose-paginate-v2');
exports.ReservationsSchema = mongoose_1.SchemaFactory.createForClass(matap_api_1.Reservation)
    .plugin(mongoosePaginate)
    .pre(['find', 'findOne', 'findOneAndUpdate'], function () {
    this.lean();
});
let ReservationsRepo = class ReservationsRepo {
    constructor(reservationsDB) {
        this.reservationsDB = reservationsDB;
    }
    findUserReservations(userId) {
        return this.crud()
            .orWhere({ 'issuer.user': (0, utils_1.ObjectId)(userId) })
            .orWhere({ doctor: (0, utils_1.ObjectId)(userId) })
            .project({ requestDate: 1, state: 1, due: 1, doctor: 1, trackingCode: 1, 'issuer.user': 1 })
            .populate(['doctor', 'issuer.user', { path: 'doctor', populate: { path: 'specialization', model: 'specializations' } }])
            .findMany();
    }
    findReserved(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const reserves = yield this.crud()
                .where({ doctor: (0, utils_1.ObjectId)(doctorId), 'due.date.from': { $gt: Date.now() }, state: { $ne: matap_api_1.ReservationState.CANCELLED } })
                .project({ due: 1 })
                .findMany();
            return reserves.map(r => r.due.date);
        });
    }
    ;
    query(skip, limit, fromDate, toDate, search, whiteList, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const condition = this.crud()
                .where({ 'due.date.from': { $gte: fromDate } })
                .where({ 'due.date.from': { $lte: toDate } });
            whiteList && (0, utils_1.addWhiteListFilter)(condition, whiteList);
            if (filters && filters.doctorsWhiteList && filters.doctorsWhiteList.length > 0) {
                condition.andWhere({
                    doctor: { $in: filters.doctorsWhiteList.map(i => i) }
                });
            }
            if (search) {
                condition.andWhere({
                    tag: { $regex: search, $options: 'i' }
                });
            }
            return condition
                .skip(skip)
                .limit(limit)
                .populate(['doctor', 'issuer.user', 'issuer.admin'])
                .query();
        });
    }
    crud() {
        return new query_builder_1.default(this.reservationsDB, matap_api_1.Reservation);
    }
};
ReservationsRepo = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('reservations')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ReservationsRepo);
exports.default = ReservationsRepo;

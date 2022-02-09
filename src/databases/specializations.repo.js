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
exports.SpecializationSchema = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose/");
const mongoose_2 = require("mongoose");
const matap_api_1 = require("matap-api");
const query_builder_1 = __importDefault(require("./utils/query.builder"));
const utils_1 = require("./utils");
const mongoosePaginate = require('mongoose-paginate-v2');
exports.SpecializationSchema = mongoose_1.SchemaFactory.createForClass(matap_api_1.Specialization)
    .plugin(mongoosePaginate)
    .pre(['find', 'findOne', 'findOneAndUpdate'], function () {
    this.lean();
});
let SpecializationsRepo = class SpecializationsRepo {
    constructor(specializationDB) {
        this.specializationDB = specializationDB;
    }
    query(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { skip, limit, projection, populations, search, whiteList } = query;
            const condition = this.crud();
            search && condition.whereTextLike({ name: search }, 'or')
                .searchId({ _id: search }, 'or');
            whiteList && (0, utils_1.addWhiteListFilter)(condition, whiteList);
            return condition
                .project(projection || { __v: 0 })
                .populate(populations)
                .skip(skip)
                .limit(limit)
                .query();
        });
    }
    crud() {
        return new query_builder_1.default(this.specializationDB, matap_api_1.Specialization);
    }
};
SpecializationsRepo = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('specializations')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], SpecializationsRepo);
exports.default = SpecializationsRepo;

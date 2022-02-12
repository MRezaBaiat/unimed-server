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
exports.HealthCentersSchema = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose/");
const mongoose_2 = require("mongoose");
const api_1 = require("api");
const query_builder_1 = __importDefault(require("./utils/query.builder"));
const utils_1 = require("./utils");
const mongoosePaginate = require('mongoose-paginate-v2');
exports.HealthCentersSchema = mongoose_1.SchemaFactory.createForClass(api_1.HealthCenter)
    .plugin(mongoosePaginate)
    .pre(['find', 'findOne', 'findOneAndUpdate'], function () {
    this.lean();
});
let HealthCentersRepo = class HealthCentersRepo {
    constructor(healthCentersDB) {
        this.healthCentersDB = healthCentersDB;
    }
    query(skip, limit, search, whiteList) {
        return __awaiter(this, void 0, void 0, function* () {
            const condition = this.crud();
            if (search && search !== '') {
                condition.orWhere({ name: (0, utils_1.nameFilter)(search) });
                if ((0, utils_1.isValidObjectId)(search)) {
                    condition.orWhere({ _id: (0, utils_1.ObjectId)(search) });
                }
            }
            if (whiteList) {
                (0, utils_1.addWhiteListFilter)(condition, whiteList);
            }
            return condition
                .skip(skip)
                .limit(limit)
                .query();
        });
    }
    crud() {
        return new query_builder_1.default(this.healthCentersDB, api_1.HealthCenter);
    }
};
HealthCentersRepo = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('healthcenters')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], HealthCentersRepo);
exports.default = HealthCentersRepo;

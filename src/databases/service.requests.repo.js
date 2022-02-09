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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRequestsSchema = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose/");
const mongoose_2 = require("mongoose");
const matap_api_1 = require("matap-api");
const query_builder_1 = __importDefault(require("./utils/query.builder"));
const mongoosePaginate = require('mongoose-paginate-v2');
class ServiceRequestsQueryBuilder extends query_builder_1.default {
    constructor() {
        super(...arguments);
        this.setSeen = (id) => {
            return this.withId(id)
                .whereTextLike({ status: 'NOT_SEEN' })
                .set({ status: 'CHECKING' })
                .updateOne();
        };
    }
}
exports.ServiceRequestsSchema = mongoose_1.SchemaFactory.createForClass(matap_api_1.ServiceRequest)
    .plugin(mongoosePaginate)
    .pre(['find', 'findOne', 'findOneAndUpdate'], function () {
    this.lean();
});
let ServiceRequestsRepo = class ServiceRequestsRepo {
    constructor(serviceRequestsDB) {
        this.serviceRequestsDB = serviceRequestsDB;
    }
    crud() {
        return new ServiceRequestsQueryBuilder(this.serviceRequestsDB, matap_api_1.ServiceRequest);
    }
};
ServiceRequestsRepo = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('service_requests')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ServiceRequestsRepo);
exports.default = ServiceRequestsRepo;

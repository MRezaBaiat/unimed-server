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
exports.AdminLogSchema = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose/");
const mongoose_2 = require("mongoose");
const api_1 = require("api");
const query_builder_1 = __importDefault(require("./utils/query.builder"));
const mongoosePaginate = require('mongoose-paginate-v2');
exports.AdminLogSchema = mongoose_1.SchemaFactory.createForClass(api_1.AdminLog)
    .plugin(mongoosePaginate)
    .pre(['find', 'findOne', 'findOneAndUpdate'], function () {
    this.lean();
});
let AdminLogsRepo = class AdminLogsRepo {
    constructor(adminLogsDB) {
        this.adminLogsDB = adminLogsDB;
    }
    crud() {
        return new query_builder_1.default(this.adminLogsDB, api_1.AdminLog);
    }
};
AdminLogsRepo = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('admin-logs')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AdminLogsRepo);
exports.default = AdminLogsRepo;

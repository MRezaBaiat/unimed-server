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
exports.CallsAdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_jwt_auth_guard_1 = require("../../guards/admin.jwt.auth.guard");
const calls_repo_1 = __importDefault(require("../../databases/calls.repo"));
const calls_service_1 = require("./calls.service");
let CallsAdminController = class CallsAdminController {
    constructor(callsRepo, callsService) {
        this.callsRepo = callsRepo;
        this.callsService = callsService;
    }
    handleGet(conferenceId) {
        return this.callsRepo.crud().withId(conferenceId).findOne();
    }
    handleQuery(search, skip, limit, userId, from, to) {
        return this.callsService.query({ skip: Number(skip), limit: Number(limit), search, userId, from: Number(from), to: Number(to) });
    }
};
__decorate([
    (0, common_1.Get)('/conference'),
    __param(0, (0, common_1.Query)('conferenceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CallsAdminController.prototype, "handleGet", null);
__decorate([
    (0, common_1.Get)('/query'),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('skip')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('userId')),
    __param(4, (0, common_1.Query)('from')),
    __param(5, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object]),
    __metadata("design:returntype", void 0)
], CallsAdminController.prototype, "handleQuery", null);
CallsAdminController = __decorate([
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard),
    (0, common_1.Controller)('admin/calls'),
    __metadata("design:paramtypes", [calls_repo_1.default, calls_service_1.CallsService])
], CallsAdminController);
exports.CallsAdminController = CallsAdminController;

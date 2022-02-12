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
exports.SurveysAdminController = void 0;
const common_1 = require("@nestjs/common");
const whitelist_decorator_1 = __importDefault(require("../../decorators/whitelist.decorator"));
const visits_repo_1 = __importDefault(require("../../databases/visits.repo"));
const admin_jwt_auth_guard_1 = require("../../guards/admin.jwt.auth.guard");
let SurveysAdminController = class SurveysAdminController {
    constructor(visitsRepo) {
        this.visitsRepo = visitsRepo;
    }
    handleQuery(skip, limit, search, from, to, allowedUsers, whiteList) {
        const notEmpty = (val) => val && val !== '' ? val : undefined;
        return this.visitsRepo.querySurveys({ limit, skip, search: notEmpty(search), dateRange: to && from ? { from: notEmpty(from), to: notEmpty(to) } : undefined, doctorsWhitelist: allowedUsers, whiteList: whiteList });
    }
};
__decorate([
    (0, common_1.Get)('/query'),
    __param(0, (0, common_1.Query)('skip')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('from')),
    __param(4, (0, common_1.Query)('to')),
    __param(5, (0, whitelist_decorator_1.default)('users')),
    __param(6, (0, whitelist_decorator_1.default)('visits')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object]),
    __metadata("design:returntype", void 0)
], SurveysAdminController.prototype, "handleQuery", null);
SurveysAdminController = __decorate([
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard),
    (0, common_1.Controller)('admin/surveys'),
    __metadata("design:paramtypes", [visits_repo_1.default])
], SurveysAdminController);
exports.SurveysAdminController = SurveysAdminController;

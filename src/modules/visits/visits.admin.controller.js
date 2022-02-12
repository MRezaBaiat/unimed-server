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
const common_1 = require("@nestjs/common/");
const admin_jwt_auth_guard_1 = require("../../guards/admin.jwt.auth.guard");
const visits_service_1 = require("./visits.service");
const whitelist_decorator_1 = __importDefault(require("../../decorators/whitelist.decorator"));
const id_access_guard_1 = require("../../guards/id.access.guard");
const visits_repo_1 = __importDefault(require("../../databases/visits.repo"));
let VisitsAdminController = class VisitsAdminController {
    constructor(visitsService, visitsRepo) {
        this.visitsService = visitsService;
        this.visitsRepo = visitsRepo;
    }
    handleQuery(query, allowedUsers, whiteList) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = Number(query.skip);
            const limit = Number(query.limit);
            const { id, search, from, to, moneyReturned, visitStatus, discount } = query;
            const notEmpty = (val) => val && val !== '' ? val : undefined;
            return this.visitsRepo.query({ userId: id, skip, limit, search: notEmpty(search), dateRange: { from: notEmpty(from), to: notEmpty(to) }, doctorsWhiteList: allowedUsers, filters: { visitStatus: notEmpty(visitStatus), discount: notEmpty(discount), moneyReturned: notEmpty(moneyReturned), visitsWhiteList: whiteList } });
        });
    }
    handleGetVisit(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.visitsRepo.crud().withId(id)
                .project({ __v: 0, conversations: 0 })
                .populate(['doctor', 'patient']).findOne();
        });
    }
    handleReturnPayment(body) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.visitsService.returnPaidAmount(body.id);
        });
    }
    handleEndVisit(body) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, returnMoney } = body;
            return this.visitsService.endVisit(id, returnMoney);
        });
    }
};
__decorate([
    (0, common_1.Get)('/query'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, whitelist_decorator_1.default)('users')),
    __param(2, (0, whitelist_decorator_1.default)('visits')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], VisitsAdminController.prototype, "handleQuery", null);
__decorate([
    (0, common_1.UseGuards)((0, id_access_guard_1.IdAccessGuard)('visits', r => r.query.id)),
    (0, common_1.Get)('/'),
    __param(0, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VisitsAdminController.prototype, "handleGetVisit", null);
__decorate([
    (0, common_1.UseGuards)((0, id_access_guard_1.IdAccessGuard)('visits', r => r.body.id)),
    (0, common_1.Patch)('/return_payment'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VisitsAdminController.prototype, "handleReturnPayment", null);
__decorate([
    (0, common_1.UseGuards)((0, id_access_guard_1.IdAccessGuard)('visits', r => r.body.id)),
    (0, common_1.Patch)('/end'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VisitsAdminController.prototype, "handleEndVisit", null);
VisitsAdminController = __decorate([
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard),
    (0, common_1.Controller)('admin/visits'),
    __metadata("design:paramtypes", [visits_service_1.VisitsService, visits_repo_1.default])
], VisitsAdminController);
exports.default = VisitsAdminController;

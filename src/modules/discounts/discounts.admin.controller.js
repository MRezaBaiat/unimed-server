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
const discount_create_dto_1 = __importDefault(require("./dto/discount.create.dto"));
const discounts_service_1 = require("./discounts.service");
const discounts_repo_1 = __importDefault(require("../../databases/discounts.repo"));
const discount_patch_dto_1 = __importDefault(require("./dto/discount.patch.dto"));
const id_access_guard_1 = require("../../guards/id.access.guard");
const whitelist_decorator_1 = __importDefault(require("../../decorators/whitelist.decorator"));
let DiscountsAdminController = class DiscountsAdminController {
    constructor(discountsService, discountsRepo) {
        this.discountsService = discountsService;
        this.discountsRepo = discountsRepo;
    }
    handleCreate(body) {
        return this.discountsRepo.crud().create(Object.assign(Object.assign({}, body), { usages: [] }));
    }
    handlePatch(body) {
        return this.discountsRepo.crud().withId(body._id)
            .set(body)
            .updateOne();
    }
    handleDelete(id) {
        return this.discountsRepo.crud().withId(id).deleteOne();
    }
    handleQuery(search, skip, limit, whiteList) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.discountsService.query({ skip: Number(skip), limit: Number(limit), search, whiteList });
        });
    }
    handleGet(id) {
        return this.discountsRepo.crud().withId(id)
            .project({ __v: 0, usages: 0 })
            .findOne();
    }
};
__decorate([
    (0, common_1.Post)('/'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [discount_create_dto_1.default]),
    __metadata("design:returntype", void 0)
], DiscountsAdminController.prototype, "handleCreate", null);
__decorate([
    (0, common_1.UseGuards)((0, id_access_guard_1.IdAccessGuard)('discounts', r => r.body._id)),
    (0, common_1.Patch)('/'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [discount_patch_dto_1.default]),
    __metadata("design:returntype", void 0)
], DiscountsAdminController.prototype, "handlePatch", null);
__decorate([
    (0, common_1.UseGuards)((0, id_access_guard_1.IdAccessGuard)('discounts', r => r.query._id)),
    (0, common_1.Delete)('/'),
    __param(0, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DiscountsAdminController.prototype, "handleDelete", null);
__decorate([
    (0, common_1.Get)('/query'),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('skip')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, whitelist_decorator_1.default)('discounts')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], DiscountsAdminController.prototype, "handleQuery", null);
__decorate([
    (0, common_1.UseGuards)((0, id_access_guard_1.IdAccessGuard)('discounts', r => r.query._id)),
    (0, common_1.Get)('/'),
    __param(0, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DiscountsAdminController.prototype, "handleGet", null);
DiscountsAdminController = __decorate([
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard),
    (0, common_1.Controller)('admin/discounts'),
    __metadata("design:paramtypes", [discounts_service_1.DiscountsService, discounts_repo_1.default])
], DiscountsAdminController);
exports.default = DiscountsAdminController;

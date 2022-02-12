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
exports.SpecializationsAdminController = void 0;
const common_1 = require("@nestjs/common");
const specializations_service_1 = require("./specializations.service");
const specializations_repo_1 = __importDefault(require("../../databases/specializations.repo"));
const specializations_create_dto_1 = __importDefault(require("./dto/specializations.create.dto"));
const specialization_patch_dto_1 = __importDefault(require("./dto/specialization.patch.dto"));
const id_access_guard_1 = require("../../guards/id.access.guard");
const whitelist_decorator_1 = __importDefault(require("../../decorators/whitelist.decorator"));
const admin_jwt_auth_guard_1 = require("../../guards/admin.jwt.auth.guard");
let SpecializationsAdminController = class SpecializationsAdminController {
    constructor(specializationsService, specializationsRepo) {
        this.specializationsService = specializationsService;
        this.specializationsRepo = specializationsRepo;
    }
    handleCreate(body) {
        return this.specializationsRepo.crud().create(body);
    }
    handlePatch(body) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.specializationsRepo.crud().withId(body._id)
                .set({ name: body.name })
                .updateOne();
            return this.specializationsRepo.crud().withId(body._id).findOne();
        });
    }
    handleDelete(id) {
        return this.specializationsRepo.crud().withId(id).deleteOne();
    }
    handleQuery(skip, limit, search, whiteList) {
        return this.specializationsRepo.query({ skip, limit, search, whiteList: whiteList });
    }
    handleGet(id) {
        return this.specializationsRepo.crud().withId(id).findOne();
    }
};
__decorate([
    (0, common_1.Post)('/'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [specializations_create_dto_1.default]),
    __metadata("design:returntype", void 0)
], SpecializationsAdminController.prototype, "handleCreate", null);
__decorate([
    (0, common_1.Patch)('/'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [specialization_patch_dto_1.default]),
    __metadata("design:returntype", Promise)
], SpecializationsAdminController.prototype, "handlePatch", null);
__decorate([
    (0, common_1.UseGuards)((0, id_access_guard_1.IdAccessGuard)('specializations', r => r.query.id)),
    (0, common_1.Delete)('/'),
    __param(0, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SpecializationsAdminController.prototype, "handleDelete", null);
__decorate([
    (0, common_1.Get)('/query'),
    __param(0, (0, common_1.Query)('skip')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, whitelist_decorator_1.default)('specializations')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", void 0)
], SpecializationsAdminController.prototype, "handleQuery", null);
__decorate([
    (0, common_1.UseGuards)((0, id_access_guard_1.IdAccessGuard)('specializations', r => r.query.id)),
    (0, common_1.Get)('/'),
    __param(0, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SpecializationsAdminController.prototype, "handleGet", null);
SpecializationsAdminController = __decorate([
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard),
    (0, common_1.Controller)('admin/specializations'),
    __metadata("design:paramtypes", [specializations_service_1.SpecializationsService, specializations_repo_1.default])
], SpecializationsAdminController);
exports.SpecializationsAdminController = SpecializationsAdminController;

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
const common_1 = require("@nestjs/common/");
const admin_jwt_auth_guard_1 = require("../../guards/admin.jwt.auth.guard");
const health_center_create_dto_1 = __importDefault(require("./dto/health.center.create.dto"));
const health_centers_repo_1 = __importDefault(require("../../databases/health.centers.repo"));
const health_center_patch_dto_1 = __importDefault(require("./dto/health.center.patch.dto"));
const id_access_guard_1 = require("../../guards/id.access.guard");
const health_centers_service_1 = require("./health.centers.service");
const whitelist_decorator_1 = __importDefault(require("../../decorators/whitelist.decorator"));
let AdminHealthCentersController = class AdminHealthCentersController {
    constructor(healthCentersRepo, healthCentersService) {
        this.healthCentersRepo = healthCentersRepo;
        this.healthCentersService = healthCentersService;
    }
    handleCreate(body) {
        return this.healthCentersRepo.crud().create(body);
    }
    handlePatch(body) {
        return this.healthCentersRepo.crud().withId(body._id)
            .set(body)
            .updateOne();
    }
    handleDelete(id) {
        return this.healthCentersService.deleteHealthCenter(id);
    }
    handleQuery(skip, limit, search, whiteList) {
        return this.healthCentersRepo.query(Number(skip), Number(limit), search, whiteList);
    }
    handleGet(id) {
        return this.healthCentersRepo.crud().withId(id).findOne();
    }
    handleUpdateLogoImage(request, id) {
        return this.healthCentersService.updateLogoImage(id, request);
    }
    handleUpdateWallpaperImage(request, id) {
        return this.healthCentersService.updateWallpaperImage(id, request);
    }
    handleGetIn(id) {
        return this.healthCentersService.getDoctorsInHealthCenter(id);
    }
};
__decorate([
    (0, common_1.Post)('/'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [health_center_create_dto_1.default]),
    __metadata("design:returntype", void 0)
], AdminHealthCentersController.prototype, "handleCreate", null);
__decorate([
    (0, common_1.UseGuards)((0, id_access_guard_1.IdAccessGuard)('healthCenters', r => r.body._id)),
    (0, common_1.Patch)('/'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [health_center_patch_dto_1.default]),
    __metadata("design:returntype", void 0)
], AdminHealthCentersController.prototype, "handlePatch", null);
__decorate([
    (0, common_1.UseGuards)((0, id_access_guard_1.IdAccessGuard)('healthCenters', r => r.query.id)),
    (0, common_1.Delete)('/'),
    __param(0, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminHealthCentersController.prototype, "handleDelete", null);
__decorate([
    (0, common_1.Get)('/query'),
    __param(0, (0, common_1.Query)('skip')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, whitelist_decorator_1.default)('healthCenters')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", void 0)
], AdminHealthCentersController.prototype, "handleQuery", null);
__decorate([
    (0, common_1.UseGuards)((0, id_access_guard_1.IdAccessGuard)('healthCenters', r => r.query.id)),
    (0, common_1.Get)('/'),
    __param(0, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminHealthCentersController.prototype, "handleGet", null);
__decorate([
    (0, common_1.UseGuards)((0, id_access_guard_1.IdAccessGuard)('healthCenters', r => r.query.id)),
    (0, common_1.Patch)('/logoimage'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdminHealthCentersController.prototype, "handleUpdateLogoImage", null);
__decorate([
    (0, common_1.UseGuards)((0, id_access_guard_1.IdAccessGuard)('healthCenters', r => r.query.id)),
    (0, common_1.Patch)('/wallpaperimage'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdminHealthCentersController.prototype, "handleUpdateWallpaperImage", null);
__decorate([
    (0, common_1.UseGuards)((0, id_access_guard_1.IdAccessGuard)('healthCenters', r => r.query.id)),
    (0, common_1.Get)('/in'),
    __param(0, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminHealthCentersController.prototype, "handleGetIn", null);
AdminHealthCentersController = __decorate([
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard),
    (0, common_1.Controller)('admin/healthcenters'),
    __metadata("design:paramtypes", [health_centers_repo_1.default, health_centers_service_1.HealthCentersService])
], AdminHealthCentersController);
exports.default = AdminHealthCentersController;

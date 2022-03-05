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
exports.AdminsAdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_jwt_auth_guard_1 = require("../../guards/admin.jwt.auth.guard");
const admin_create_dto_1 = __importDefault(require("./dto/admin.create.dto"));
const admins_service_1 = require("./admins.service");
const admin_patch_dto_1 = __importDefault(require("./dto/admin.patch.dto"));
const id_access_guard_1 = require("../../guards/id.access.guard");
const admins_repo_1 = __importDefault(require("../../databases/admins.repo"));
const whitelist_decorator_1 = __importDefault(require("../../decorators/whitelist.decorator"));
let AdminsAdminController = class AdminsAdminController {
    constructor(adminsService, adminsRepo) {
        this.adminsService = adminsService;
        this.adminsRepo = adminsRepo;
    }
    handleCreate(body) {
        return this.adminsService.createAdmin(body);
    }
    handlePatch(body) {
        return this.adminsRepo.crud().withId(body._id)
            .set(body)
            .updateOne();
    }
    handleQuery(search, skip, limit, whiteList) {
        return this.adminsRepo.query({ search, skip: Number(skip), limit: Number(limit), whiteList });
    }
    handleGet(id) {
        const privilegeKeys = [
            'users',
            'admins',
            'visits',
            'healthCenters',
            'adminLogs',
            'discounts',
            'serverConfigs',
            'specializations',
            'transactions'
        ];
        const dbNames = {
            users: 'users',
            admins: 'admins',
            visits: 'visits',
            healthCenters: 'healthcenters',
            adminLogs: 'admin-logs',
            discounts: 'discount_coupons',
            serverConfigs: 'server_config',
            specializations: 'specializations',
            transactions: 'transactions'
        };
        const privilegeOptionKeys = ['post', 'patch', 'delete', 'get', 'put'];
        const populations = [];
        privilegeKeys.forEach((key1) => {
            privilegeOptionKeys.forEach((key2) => {
                populations.push({ path: 'privileges.' + key1 + '.' + key2 + '.whiteList', model: dbNames[key1] });
            });
        });
        return this.adminsRepo.crud().withId(id)
            .project({ __v: 0 })
            .populate(populations)
            .findOne();
    }
};
__decorate([
    (0, common_1.Post)('/'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_create_dto_1.default]),
    __metadata("design:returntype", void 0)
], AdminsAdminController.prototype, "handleCreate", null);
__decorate([
    (0, common_1.UseGuards)((0, id_access_guard_1.IdAccessGuard)('admins', r => r.body._id)),
    (0, common_1.Patch)('/'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_patch_dto_1.default]),
    __metadata("design:returntype", void 0)
], AdminsAdminController.prototype, "handlePatch", null);
__decorate([
    (0, common_1.Get)('/query'),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('skip')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, whitelist_decorator_1.default)('admins')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", void 0)
], AdminsAdminController.prototype, "handleQuery", null);
__decorate([
    (0, common_1.UseGuards)((0, id_access_guard_1.IdAccessGuard)('admins', r => r.query.id)),
    (0, common_1.Get)('/'),
    __param(0, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminsAdminController.prototype, "handleGet", null);
AdminsAdminController = __decorate([
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard),
    (0, common_1.Controller)('admin/admins'),
    __metadata("design:paramtypes", [admins_service_1.AdminsService, admins_repo_1.default])
], AdminsAdminController);
exports.AdminsAdminController = AdminsAdminController;

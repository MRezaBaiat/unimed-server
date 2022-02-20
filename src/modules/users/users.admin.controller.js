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
exports.UsersAdminController = void 0;
const common_1 = require("@nestjs/common");
const doctor_create_dto_1 = __importDefault(require("./dto/doctor.create.dto"));
const users_service_1 = require("./users.service");
const id_access_guard_1 = require("../../guards/id.access.guard");
const users_repo_1 = __importDefault(require("../../databases/users.repo"));
const api_1 = require("api");
const admin_jwt_auth_guard_1 = require("../../guards/admin.jwt.auth.guard");
const clients_socket_service_1 = require("../socket/clients.socket.service");
const visits_repo_1 = __importDefault(require("../../databases/visits.repo"));
const admin_signin_dto_1 = __importDefault(require("./dto/admin.signin.dto"));
const auth_service_1 = require("../auth/auth.service");
const admins_repo_1 = __importDefault(require("../../databases/admins.repo"));
const userid_decorator_1 = __importDefault(require("../../decorators/userid.decorator"));
const whitelist_decorator_1 = __importDefault(require("../../decorators/whitelist.decorator"));
const utils_1 = require("../../databases/utils");
let UsersAdminController = class UsersAdminController {
    constructor(usersService, adminsRepo, authService, usersRepo, socketService, visitsRepo) {
        this.usersService = usersService;
        this.adminsRepo = adminsRepo;
        this.authService = authService;
        this.usersRepo = usersRepo;
        this.socketService = socketService;
        this.visitsRepo = visitsRepo;
    }
    handleAdminSignIn(body) {
        return this.authService.signInAdmin(body.username, body.password);
    }
    handleAdminRenew(userId, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const admin = yield this.adminsRepo.crud().withId(userId)
                .project({ __v: 0, username: 0, password: 0 })
                .findOne();
            const token = yield this.authService.generateAccessToken(admin);
            response
                .setCookie('authorization', token, {
                path: '/',
                sameSite: 'none',
                secure: true
            })
                .send({ admin, token })
                .status(200)
                .send();
        });
    }
    handleCreateDoctor(body) {
        return this.usersService.createNew(body);
    }
    handleGetUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.usersRepo.crud().withId(id).findOne();
        });
    }
    handlePatchUser(body) {
        return __awaiter(this, void 0, void 0, function* () {
            if (body.details) {
                body.details.hospitals = body.details.hospitals.map((h) => (0, utils_1.ObjectId)(h._id));
                body.details.clinics = body.details.clinics.map((c) => (0, utils_1.ObjectId)(c._id));
            }
            if (body.specialization) {
                body.specialization = (0, utils_1.ObjectId)(body.specialization._id);
            }
            yield this.usersRepo.crud().withId(body._id).set({
                mobile: body.mobile,
                name: body.name,
                code: body.code,
                specialization: body.specialization,
                price: body.price,
                details: body.details,
                gender: body.gender,
                settings: body.settings
            }).updateOne();
        });
    }
    handleDeleteUser(id) {
        return this.usersService.deleteUser(id);
    }
    handleQuery(skip, limit, type, search, whiteList) {
        return __awaiter(this, void 0, void 0, function* () {
            const queryRes = yield this.usersRepo.query({ skip, limit, type, search, whiteList, onlyVisibleDoctors: false, searchByMobile: true });
            const statuses = yield this.socketService.getStatuses(queryRes.results.map(user => user._id));
            for (const user of queryRes.results) {
                const item = statuses.find(s => s._id === user._id);
                queryRes.results[queryRes.results.indexOf(user)] = { user, visit: yield this.visitsRepo.findActiveVisit(user._id), isOnline: item.isOnline };
            }
            return queryRes;
        });
    }
    handlePostProfileImage(req, userId) {
        return this.usersService.updateProfileImage(req, userId);
    }
    handleGetJoiningDatesReport() {
        return this.usersService.createJoiningDateReport();
    }
};
__decorate([
    (0, common_1.Post)('/signin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_signin_dto_1.default]),
    __metadata("design:returntype", void 0)
], UsersAdminController.prototype, "handleAdminSignIn", null);
__decorate([
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard),
    (0, common_1.Get)('/signin/renew'),
    __param(0, (0, userid_decorator_1.default)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersAdminController.prototype, "handleAdminRenew", null);
__decorate([
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard),
    (0, common_1.Post)('/'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [doctor_create_dto_1.default]),
    __metadata("design:returntype", void 0)
], UsersAdminController.prototype, "handleCreateDoctor", null);
__decorate([
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard, (0, id_access_guard_1.IdAccessGuard)('users', r => r.query.id)),
    (0, common_1.Get)('/'),
    __param(0, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersAdminController.prototype, "handleGetUser", null);
__decorate([
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard, (0, id_access_guard_1.IdAccessGuard)('users', r => r.body._id)),
    (0, common_1.Patch)('/'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [api_1.User]),
    __metadata("design:returntype", Promise)
], UsersAdminController.prototype, "handlePatchUser", null);
__decorate([
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard, (0, id_access_guard_1.IdAccessGuard)('users', r => r.query.id)),
    (0, common_1.Delete)('/'),
    __param(0, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersAdminController.prototype, "handleDeleteUser", null);
__decorate([
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard),
    (0, common_1.Get)('/query'),
    __param(0, (0, common_1.Query)('skip')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('type')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, whitelist_decorator_1.default)('users')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersAdminController.prototype, "handleQuery", null);
__decorate([
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard),
    (0, common_1.Post)('/profileimage'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('userid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], UsersAdminController.prototype, "handlePostProfileImage", null);
__decorate([
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard),
    (0, common_1.Get)('/joining_dates_report'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UsersAdminController.prototype, "handleGetJoiningDatesReport", null);
UsersAdminController = __decorate([
    (0, common_1.Controller)('admin/users'),
    __metadata("design:paramtypes", [users_service_1.UsersService, admins_repo_1.default, auth_service_1.AuthService, users_repo_1.default, clients_socket_service_1.ClientsSocketService, visits_repo_1.default])
], UsersAdminController);
exports.UsersAdminController = UsersAdminController;

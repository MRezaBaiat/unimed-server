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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const user_signin_dto_1 = __importDefault(require("./dto/user.signin.dto"));
const auth_service_1 = require("../auth/auth.service");
const not_found_error_1 = __importDefault(require("../../errors/not-found-error"));
const users_service_1 = require("./users.service");
const api_1 = require("api");
const users_repo_1 = __importDefault(require("../../databases/users.repo"));
const sms_service_1 = __importDefault(require("../notifications/sms.service"));
const otp_signin_dto_1 = __importDefault(require("./dto/otp.signin.dto"));
const server_configs_repo_1 = __importDefault(require("../../databases/server.configs.repo"));
const jwt_auth_guard_1 = require("../../guards/jwt.auth.guard");
const userid_decorator_1 = __importDefault(require("../../decorators/userid.decorator"));
const doctor_post_visit_dto_1 = __importDefault(require("../visits/dto/doctor.post.visit.dto"));
const visits_service_1 = require("../visits/visits.service");
const patient_post_visit_dto_1 = __importDefault(require("../visits/dto/patient.post.visit.dto"));
const internal_server_error_1 = __importDefault(require("../../errors/internal-server-error"));
const user_worktimes_update_dto_1 = __importDefault(require("./dto/user.worktimes.update.dto"));
const user_profile_update_dto_1 = __importDefault(require("./dto/user.profile.update.dto"));
const badrequest_error_1 = __importDefault(require("../../errors/badrequest-error"));
let UsersController = class UsersController {
    constructor(authService, usersService, usersRepo, smsService, configsRepo, visitsService) {
        this.authService = authService;
        this.usersService = usersService;
        this.usersRepo = usersRepo;
        this.smsService = smsService;
        this.configsRepo = configsRepo;
        this.visitsService = visitsService;
    }
    handleSignIn(body, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const otp = yield this.authService.signIn(body.mobile);
                console.log(otp);
                response.status(200).send();
            }
            catch (e) {
                if (e instanceof not_found_error_1.default) {
                    const user = yield this.usersService.createNew(new api_1.User(api_1.UserType.PATIENT, body.mobile));
                    const otp = yield this.authService.generateOTP(user._id);
                    yield this.usersRepo
                        .crud()
                        .withId(user._id)
                        .set({ sms_code: otp })
                        .updateOne();
                    console.log(otp);
                    yield this.smsService.sendOTP(body.mobile, otp);
                    return response.status(200).send();
                }
                response.status(400).send();
            }
        });
    }
    handleOtpSignIn(body, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user, token, updateInfo } = yield this.authService.loginUsingOTP(body.otp);
            this.usersRepo
                .crud()
                .withId(user._id)
                .set({ fcmtoken: body.fcmtoken })
                .set({ os: body.os })
                .updateOne();
            response
                .setCookie('authorization', token, {
                path: '/',
                sameSite: 'none',
                secure: true
            })
                .send({ user, token, updateInfo })
                .status(200)
                .send();
        });
    }
    handleTAC() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.configsRepo.getConfigs()).termsandconditions;
        });
    }
    handleGetPreview(code) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.usersRepo.crud().where({ type: api_1.UserType.DOCTOR, code: Number(code) })
                .project({ _id: 1, name: 1, imageUrl: 1, code: 1, 'details.response_days': 1, specialization: 1, price: 1 })
                .populate(['specialization'])
                .findOne();
        });
    }
    handleQueryDoctors(skip, limit, search) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.usersRepo.query({
                type: api_1.UserType.DOCTOR,
                skip,
                limit,
                search,
                searchByMobile: false,
                onlyVisibleDoctors: !search || isNaN(Number(search)),
                projection: { _id: 1, name: 1, mobile: 1, ready: 1, type: 1, imageUrl: 1, code: 1, 'details.response_days': 1, specialization: 1, price: 1, 'details.reservationInfo': 1, 'details.videoCallAllowed': 1 }
            });
        });
    }
    handleRenew(response, userId, os, version, authorization, fcmtoken) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.usersRepo.crud().withId(userId)
                .populate(['specialization'])
                .project({ sms_code: 0, fcmtoken: 0 })
                .findOne();
            const token = yield this.authService.generateAccessToken(user);
            yield this.usersRepo.crud().withId(user._id).set({ os, fcmtoken }).updateOne();
            const updateInfo = { available: false };
            response
                .setCookie('authorization', token, {
                path: '/',
                sameSite: 'none',
                secure: true
            })
                .send({ user, token, updateInfo })
                .status(200)
                .send();
        });
    }
    handlePostVisitDoctor(userId, body) {
        return this.visitsService.finalizeVisitForDoctor(userId, body);
    }
    handlePostVisitPatient(userId, body) {
        return this.visitsService.finalizeVisitForPatient(userId, body);
    }
    handleUploadProfileImage(req, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.usersService.updateProfileImage(req, userId);
        });
    }
    handleGetWorkTimes(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.usersRepo.crud().withId(userId).project({ type: 1, details: 1 }).findOne();
            if (!user || user.type !== api_1.UserType.DOCTOR) {
                throw new internal_server_error_1.default();
            }
            return user.details.responseDays;
        });
    }
    handleUpdateWorkTimes(userId, workTimes) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.usersRepo.crud().withId(userId).project({ type: 1, details: 1 }).findOne();
            if (!user || user.type !== api_1.UserType.DOCTOR) {
                throw new internal_server_error_1.default();
            }
            const days = ['0', '1', '2', '3', '4', '5', '6'];
            for (const day of days) {
                if (!workTimes[day]) {
                    throw new badrequest_error_1.default('Request is not in correct format');
                }
                for (const rt of workTimes[day]) {
                    if (!rt.from || !rt.to || (rt.healthCenter && typeof rt.healthCenter !== 'string')) {
                        throw new badrequest_error_1.default('Request is not in correct format');
                    }
                }
            }
            yield this.usersRepo.crud().withId(userId)
                .set({
                details: Object.assign(Object.assign({}, user.details), { responseDays: workTimes })
            }).updateOne();
            return true;
        });
    }
    handleUpdateProfile(userId, body) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.usersRepo.crud().withId(userId)
                .set({ name: body.name, gender: body.gender })
                .updateOne();
            return this.usersRepo.crud().withId(userId)
                .project({ fcmtoken: 0, sms_code: 0 })
                .populate(['specialization'])
                .findOne();
        });
    }
};
__decorate([
    (0, common_1.Post)('/signin'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_signin_dto_1.default, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "handleSignIn", null);
__decorate([
    (0, common_1.Post)('/signin/otp'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [otp_signin_dto_1.default, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "handleOtpSignIn", null);
__decorate([
    (0, common_1.Get)('/termsandconditions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "handleTAC", null);
__decorate([
    (0, common_1.Get)('/preview'),
    __param(0, (0, common_1.Query)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "handleGetPreview", null);
__decorate([
    (0, common_1.Get)('/query'),
    __param(0, (0, common_1.Query)('skip')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "handleQueryDoctors", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('/signin/renew'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, userid_decorator_1.default)()),
    __param(2, (0, common_1.Headers)('os')),
    __param(3, (0, common_1.Headers)('version')),
    __param(4, (0, common_1.Headers)('authorization')),
    __param(5, (0, common_1.Headers)('fcmtoken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "handleRenew", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('/postvisit_doctor'),
    __param(0, (0, userid_decorator_1.default)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, doctor_post_visit_dto_1.default]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "handlePostVisitDoctor", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('/postvisit_patient'),
    __param(0, (0, userid_decorator_1.default)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, patient_post_visit_dto_1.default]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "handlePostVisitPatient", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('/profileimage'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, userid_decorator_1.default)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "handleUploadProfileImage", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('/worktimes'),
    __param(0, (0, userid_decorator_1.default)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "handleGetWorkTimes", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)('/worktimes'),
    __param(0, (0, userid_decorator_1.default)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_worktimes_update_dto_1.default]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "handleUpdateWorkTimes", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)('/'),
    __param(0, (0, userid_decorator_1.default)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_profile_update_dto_1.default]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "handleUpdateProfile", null);
UsersController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        users_service_1.UsersService,
        users_repo_1.default,
        sms_service_1.default,
        server_configs_repo_1.default,
        visits_service_1.VisitsService])
], UsersController);
exports.UsersController = UsersController;

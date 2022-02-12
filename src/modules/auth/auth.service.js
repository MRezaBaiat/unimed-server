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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const badrequest_error_1 = __importDefault(require("../../errors/badrequest-error"));
const users_repo_1 = __importDefault(require("../../databases/users.repo"));
const not_found_error_1 = __importDefault(require("../../errors/not-found-error"));
const otp_service_1 = __importDefault(require("../redis/otp.service"));
const sms_service_1 = __importDefault(require("../notifications/sms.service"));
const admins_repo_1 = __importDefault(require("../../databases/admins.repo"));
let AuthService = class AuthService {
    constructor(jwtService, usersRepo, otpService, smsService, adminsRepo) {
        this.jwtService = jwtService;
        this.usersRepo = usersRepo;
        this.otpService = otpService;
        this.smsService = smsService;
        this.adminsRepo = adminsRepo;
    }
    signInAdmin(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!username || !password) {
                throw new badrequest_error_1.default();
            }
            const admin = yield this.adminsRepo.crud()
                .where({ username, password })
                .project({ __v: 0, username: 0, password: 0 })
                .findOne();
            if (!admin) {
                throw new not_found_error_1.default();
            }
            return {
                token: yield this.generateAccessToken(admin),
                admin
            };
        });
    }
    signIn(mobile) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mobile) {
                throw new badrequest_error_1.default();
            }
            const user = yield this.usersRepo
                .crud()
                .where({ mobile })
                .project({ _id: 1 })
                .findOne();
            if (!user) {
                throw new not_found_error_1.default();
            }
            const otp = yield this.generateOTP(user._id);
            this.smsService.sendOTP(mobile, otp);
            yield this.usersRepo.crud().set({ sms_code: otp }).where({ mobile }).updateOne();
            return otp;
        });
    }
    loginUsingOTP(otp) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = yield this.otpService.get(otp);
            console.log('for otp ', otp, id);
            if (!id) {
                throw new not_found_error_1.default();
            }
            const user = yield this.usersRepo
                .crud()
                .withId(id)
                .populate(['specialization'])
                .project({ sms_code: 0, fcmtoken: 0 })
                .findOne();
            console.log('otp returning user ', user);
            if (!user) {
                throw new not_found_error_1.default();
            }
            const token = yield this.generateAccessToken(user);
            return { token, user, updateInfo: { available: false } };
        });
    }
    generateOTP(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const randomNumber = Math.floor(100000 + Math.random() * 900000);
            yield this.otpService.set(String(randomNumber), String(userId), 60);
            return randomNumber + '';
        });
    }
    generateAccessToken(user) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!user) {
                throw new Error('Invalid User');
            }
            const payload = {
                userid: user._id
            };
            return this.jwtService.sign(payload, {
                secret: process.env.JWT_STRATEGY_SECRET_KEY,
                algorithm: 'HS256',
                issuer: process.env.TOKEN_ISSUER,
                subject: `${user._id}`
            });
        });
    }
    decode(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return this.jwtService.verify(token, {
                    secret: process.env.JWT_STRATEGY_SECRET_KEY,
                    algorithms: ['HS256'],
                    issuer: process.env.TOKEN_ISSUER
                });
            }
            catch (e) {
                return {};
            }
        });
    }
};
AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        users_repo_1.default,
        otp_service_1.default,
        sms_service_1.default,
        admins_repo_1.default])
], AuthService);
exports.AuthService = AuthService;

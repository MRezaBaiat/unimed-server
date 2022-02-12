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
const jwt_auth_guard_1 = require("../../guards/jwt.auth.guard");
const calls_service_1 = require("./calls.service");
const badrequest_error_1 = __importDefault(require("../../errors/badrequest-error"));
const userid_decorator_1 = __importDefault(require("../../decorators/userid.decorator"));
let CallsController = class CallsController {
    constructor(callsService) {
        this.callsService = callsService;
    }
    handleHangUp(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.callsService.hangUpCall(id);
            return true;
        });
    }
    handleDecline(id, body) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.callsService.declineCall(id, body.reason);
            return true;
        });
    }
    handleAccept(id, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const success = yield this.callsService.acceptCall(id, body.deviceInfo);
            if (!success) {
                throw new badrequest_error_1.default();
            }
            return true;
        });
    }
    handleInitiate(type, body, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield this.callsService.initiateCall(userId, type, body.deviceInfo);
            if (session) {
                return session;
            }
            throw new badrequest_error_1.default();
        });
    }
};
__decorate([
    (0, common_1.All)('/hangup'),
    __param(0, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CallsController.prototype, "handleHangUp", null);
__decorate([
    (0, common_1.All)('/decline'),
    __param(0, (0, common_1.Query)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CallsController.prototype, "handleDecline", null);
__decorate([
    (0, common_1.All)('/accept'),
    __param(0, (0, common_1.Query)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CallsController.prototype, "handleAccept", null);
__decorate([
    (0, common_1.Post)('/initiate'),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, userid_decorator_1.default)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], CallsController.prototype, "handleInitiate", null);
CallsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('/call'),
    __metadata("design:paramtypes", [calls_service_1.CallsService])
], CallsController);
exports.default = CallsController;

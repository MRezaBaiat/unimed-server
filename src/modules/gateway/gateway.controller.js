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
exports.GatewayController = void 0;
const common_1 = require("@nestjs/common");
const gateway_service_1 = require("./gateway.service");
const users_repo_1 = __importDefault(require("../../databases/users.repo"));
const not_found_error_1 = __importDefault(require("../../errors/not-found-error"));
const jwt_auth_guard_1 = require("../../guards/jwt.auth.guard");
const userid_decorator_1 = __importDefault(require("../../decorators/userid.decorator"));
let GatewayController = class GatewayController {
    constructor(gatewayService, usersRepo) {
        this.gatewayService = gatewayService;
        this.usersRepo = usersRepo;
    }
    handleCB(response, userid, amount, Authority, os, Status) {
        return __awaiter(this, void 0, void 0, function* () {
            if (Status === 'NOK') {
                throw new Error('payment was unsuccessful');
            }
            const user = yield this.usersRepo.crud().withId(userid)
                .project({ _id: 1, name: 1, mobile: 1, type: 1 })
                .findOne();
            if (!user) {
                throw new not_found_error_1.default(`user with id ${userid} was not found`);
            }
            yield this.gatewayService.verifyDepositTransaction(amount, Authority, user, response, os);
        });
    }
    handleGetToken(userId, response, os, amount, doctorCode) {
        return this.gatewayService.generateToken(amount / 10, doctorCode, userId, response, os);
    }
};
__decorate([
    (0, common_1.Get)('/cb'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('userid')),
    __param(2, (0, common_1.Query)('amount')),
    __param(3, (0, common_1.Query)('Authority')),
    __param(4, (0, common_1.Query)('os')),
    __param(5, (0, common_1.Query)('Status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], GatewayController.prototype, "handleCB", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('/token'),
    __param(0, (0, userid_decorator_1.default)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Query)('os')),
    __param(3, (0, common_1.Query)('amount')),
    __param(4, (0, common_1.Query)('doctorCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object]),
    __metadata("design:returntype", void 0)
], GatewayController.prototype, "handleGetToken", null);
GatewayController = __decorate([
    (0, common_1.Controller)('gateway'),
    __metadata("design:paramtypes", [gateway_service_1.GatewayService, users_repo_1.default])
], GatewayController);
exports.GatewayController = GatewayController;

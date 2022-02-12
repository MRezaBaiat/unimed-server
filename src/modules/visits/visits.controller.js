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
exports.VisitsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../guards/jwt.auth.guard");
const userid_decorator_1 = __importDefault(require("../../decorators/userid.decorator"));
const visits_repo_1 = __importDefault(require("../../databases/visits.repo"));
const visits_service_1 = require("./visits.service");
const api_1 = require("api/");
const clients_socket_service_1 = require("../socket/clients.socket.service");
let VisitsController = class VisitsController {
    constructor(visitsRepo, visitsService, socketService) {
        this.visitsRepo = visitsRepo;
        this.visitsService = visitsService;
        this.socketService = socketService;
    }
    handleGetHistory(userId, target, skip, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.visitsRepo.query({ skip: Number(skip), limit: Number(limit), userId: userId, targetId: target === 'undefined' ? undefined : target, filters: { visitStatus: api_1.VisitStatus.ENDED }, populations: ['patient', 'doctor', { path: 'doctor', populate: { path: 'specialization', model: 'specializations' } }] });
        });
    }
    handleGetConversations(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.visitsRepo.getConversationsHistory(id);
        });
    }
    handleInitiateVisit(userId, code) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.visitsService.checkVisitRequest(code, userId, 'fa');
        });
    }
};
__decorate([
    (0, common_1.Get)('/history'),
    __param(0, (0, userid_decorator_1.default)()),
    __param(1, (0, common_1.Query)('target')),
    __param(2, (0, common_1.Query)('skip')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], VisitsController.prototype, "handleGetHistory", null);
__decorate([
    (0, common_1.Get)('/conversations'),
    __param(0, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VisitsController.prototype, "handleGetConversations", null);
__decorate([
    (0, common_1.Get)('/initiate_visit'),
    __param(0, (0, userid_decorator_1.default)()),
    __param(1, (0, common_1.Query)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VisitsController.prototype, "handleInitiateVisit", null);
VisitsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('visits'),
    __metadata("design:paramtypes", [visits_repo_1.default, visits_service_1.VisitsService, clients_socket_service_1.ClientsSocketService])
], VisitsController);
exports.VisitsController = VisitsController;

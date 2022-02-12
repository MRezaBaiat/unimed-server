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
const common_1 = require("@nestjs/common");
const admin_jwt_auth_guard_1 = require("../../guards/admin.jwt.auth.guard");
const transactions_service_1 = require("./transactions.service");
const transaction_create_dto_1 = __importDefault(require("./dto/transaction.create.dto"));
const userid_decorator_1 = __importDefault(require("../../decorators/userid.decorator"));
const admins_repo_1 = __importDefault(require("../../databases/admins.repo"));
const users_repo_1 = __importDefault(require("../../databases/users.repo"));
const badrequest_error_1 = __importDefault(require("../../errors/badrequest-error"));
const id_access_guard_1 = require("../../guards/id.access.guard");
const whitelist_decorator_1 = __importDefault(require("../../decorators/whitelist.decorator"));
const transactions_repo_1 = __importDefault(require("../../databases/transactions.repo"));
const gateway_service_1 = require("../gateway/gateway.service");
let TransactionsAdminController = class TransactionsAdminController {
    constructor(transactionsService, gatewayService, transactionsRepo, usersRepo, adminsRepo) {
        this.transactionsService = transactionsService;
        this.gatewayService = gatewayService;
        this.transactionsRepo = transactionsRepo;
        this.usersRepo = usersRepo;
        this.adminsRepo = adminsRepo;
    }
    handleCreateTransaction(body, id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const admin = yield this.adminsRepo.crud().withId(userId).project({ _id: 1, name: 1 }).findOne();
            const user = yield this.usersRepo.crud().withId(id).project({ _id: 1, name: 1 }).findOne();
            if (!admin || !user) {
                throw new badrequest_error_1.default();
            }
            return yield this.transactionsService.create(Object.assign(Object.assign({}, body), { issuer: {
                    type: 'admin',
                    _id: String(admin._id),
                    name: admin.name
                }, target: {
                    _id: String(user._id),
                    name: user.name || 'user' + String(user._id)
                } }));
        });
    }
    handleGetAudit(id, type, fromDate, toDate) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.transactionsService.calculateFinancialAudit(id, type, fromDate, toDate);
        });
    }
    handleQuery(id, type, search, skip, limit, fromDate, toDate, whiteList) {
        return this.transactionsRepo.query(id, type, Number(fromDate), Number(toDate), Number(skip), Number(limit), undefined, search, whiteList);
    }
    handleQueryReports(type, search, skip, limit, fromDate, toDate, whiteList) {
        return this.transactionsService.queryReports(type, fromDate, toDate, skip, limit, search, whiteList);
    }
    handleGetTransaction(id) {
        return this.transactionsRepo.crud().withId(id)
            .populate(['healthCenter'])
            .findOne();
    }
    handleQueryAccounting(query, whiteList) {
        const { search, type } = query;
        const fromDate = Number(query.fromDate);
        const toDate = Number(query.toDate);
        const skip = Number(query.skip);
        const limit = Number(query.limit);
        return this.transactionsService.queryAllAccountings(type, fromDate, toDate, skip, limit, search, whiteList);
    }
    handleSettle(body, userId) {
        const { visitIds, amount, details, trackingCode, type, targetId } = body;
        return this.transactionsService.applySettlement(userId, targetId, visitIds, type, amount, details, trackingCode);
    }
    handleVerifyTransactions() {
        return this.gatewayService.checkUnverifiedTransactions();
    }
};
__decorate([
    (0, common_1.Post)('/'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('id')),
    __param(2, (0, userid_decorator_1.default)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transaction_create_dto_1.default, Object, Object]),
    __metadata("design:returntype", Promise)
], TransactionsAdminController.prototype, "handleCreateTransaction", null);
__decorate([
    (0, common_1.UseGuards)((0, id_access_guard_1.IdAccessGuard)('transactions', r => r.query.id)),
    (0, common_1.Get)('/audit'),
    __param(0, (0, common_1.Query)('id')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('fromDate')),
    __param(3, (0, common_1.Query)('toDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], TransactionsAdminController.prototype, "handleGetAudit", null);
__decorate([
    (0, common_1.Get)('/query'),
    __param(0, (0, common_1.Query)('id')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('skip')),
    __param(4, (0, common_1.Query)('limit')),
    __param(5, (0, common_1.Query)('fromDate')),
    __param(6, (0, common_1.Query)('toDate')),
    __param(7, (0, whitelist_decorator_1.default)('transactions')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object]),
    __metadata("design:returntype", void 0)
], TransactionsAdminController.prototype, "handleQuery", null);
__decorate([
    (0, common_1.Get)('/report/query'),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('skip')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('fromDate')),
    __param(5, (0, common_1.Query)('toDate')),
    __param(6, (0, whitelist_decorator_1.default)('transactions')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object]),
    __metadata("design:returntype", void 0)
], TransactionsAdminController.prototype, "handleQueryReports", null);
__decorate([
    (0, common_1.UseGuards)((0, id_access_guard_1.IdAccessGuard)('transactions', r => r.query.id)),
    (0, common_1.Get)('/'),
    __param(0, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TransactionsAdminController.prototype, "handleGetTransaction", null);
__decorate([
    (0, common_1.Get)('/accounting/query'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, whitelist_decorator_1.default)('transactions')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], TransactionsAdminController.prototype, "handleQueryAccounting", null);
__decorate([
    (0, common_1.Post)('/settle'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, userid_decorator_1.default)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], TransactionsAdminController.prototype, "handleSettle", null);
__decorate([
    (0, common_1.Get)('/verify-transactions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TransactionsAdminController.prototype, "handleVerifyTransactions", null);
TransactionsAdminController = __decorate([
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard),
    (0, common_1.Controller)('admin/transactions'),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService, gateway_service_1.GatewayService, transactions_repo_1.default, users_repo_1.default, admins_repo_1.default])
], TransactionsAdminController);
exports.default = TransactionsAdminController;

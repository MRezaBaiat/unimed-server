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
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const utils_1 = require("../../databases/utils");
const transactions_repo_1 = __importDefault(require("../../databases/transactions.repo"));
const api_1 = require("api");
const users_repo_1 = __importDefault(require("../../databases/users.repo"));
const visits_repo_1 = __importDefault(require("../../databases/visits.repo"));
const health_centers_repo_1 = __importDefault(require("../../databases/health.centers.repo"));
const admins_repo_1 = __importDefault(require("../../databases/admins.repo"));
const javascript_dev_kit_1 = require("javascript-dev-kit");
let TransactionsService = class TransactionsService {
    constructor(transactionsRepo, adminsRepo, healthCentersRepo, visitsRepo, usersRepo) {
        this.transactionsRepo = transactionsRepo;
        this.adminsRepo = adminsRepo;
        this.healthCentersRepo = healthCentersRepo;
        this.visitsRepo = visitsRepo;
        this.usersRepo = usersRepo;
    }
    create(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            transaction = yield this.transactionsRepo.crud().create(transaction);
            let newCurrency = 0;
            let userId;
            if (transaction.type === api_1.TransactionType.CHARGE_BY_ADMIN || transaction.type === api_1.TransactionType.CHARGE_BY_GATEWAY || transaction.type === api_1.TransactionType.STARTER_CHARGE || transaction.type === api_1.TransactionType.RETURN_VISIT_PAYMENT) {
                const user = yield this.usersRepo.crud().withId(transaction.target._id).project({ currency: 1 }).findOne();
                userId = user._id;
                newCurrency = user.currency + transaction.amount;
            }
            else if (transaction.type === api_1.TransactionType.REDUCE_BY_ADMIN) {
                const user = yield this.usersRepo.crud().withId(transaction.target._id).project({ currency: 1 }).findOne();
                userId = user._id;
                newCurrency = user.currency - transaction.amount;
            }
            else if (transaction.type === api_1.TransactionType.VISIT_PAYMENT || transaction.type === api_1.TransactionType.SERVICE_REQUEST_PAYMENT) {
                const user = yield this.usersRepo.crud().withId(transaction.issuer._id).project({ currency: 1 }).findOne();
                userId = user._id;
                newCurrency = user.currency - transaction.amount;
            }
            else if (transaction.type === api_1.TransactionType.PAYROLL) {
            }
            yield this.usersRepo.setPatientCurrency(userId, newCurrency);
            return transaction;
        });
    }
    calculateFinancialAudit(id, type = 'user', fromDate = javascript_dev_kit_1.SmartDate.MIN_ISO_DATE, toDate = javascript_dev_kit_1.SmartDate.MAX_ISO_DATE) {
        return __awaiter(this, void 0, void 0, function* () {
            let visits;
            if (type === 'user') {
                visits = yield this.visitsRepo.crud().where({ doctor: (0, utils_1.ObjectId)(id), 'receipt.return_transaction_id': undefined, state: api_1.VisitStatus.ENDED, $and: [{ end_date: { $gte: fromDate } }, { end_date: { $lte: toDate } }] })
                    .project({ _id: 1, receipt: 1 })
                    .findMany();
            }
            else {
                visits = yield this.visitsRepo.crud().where({ 'receipt.healthCenterId': (0, utils_1.ObjectId)(id), 'receipt.return_transaction_id': undefined, state: api_1.VisitStatus.ENDED, $and: [{ end_date: { $gte: fromDate } }, { end_date: { $lte: toDate } }] })
                    .project({ _id: 1, receipt: 1 })
                    .findMany();
            }
            const total = visits.map(v => v.receipt.total).reduce((a, b) => a + b, 0);
            const doctorCut = visits.map(v => v.receipt.doctorCut).reduce((a, b) => Number(a) + Number(b), 0);
            const discountAmounts = visits.map(v => v.receipt.discount).reduce((a, b) => a + b, 0);
            const medicalCenterCut = visits.map(v => v.receipt.healthCenterCut).reduce((a, b) => Number(a) + Number(b), 0);
            const unsettledVisits = visits.filter(v => (type === 'user' ? !v.receipt.settled : !v.receipt.healthCenterSettled));
            const settledVisits = visits.filter(v => (type === 'user' ? v.receipt.settled : v.receipt.healthCenterSettled));
            const paid = settledVisits.map(t => type === 'user' ? t.receipt.doctorCut : t.receipt.healthCenterCut).reduce((a, b) => Number(a) + Number(b), 0);
            const payable = unsettledVisits.map(t => type === 'user' ? t.receipt.doctorCut : t.receipt.healthCenterCut).reduce((a, b) => Number(a) + Number(b), 0);
            return {
                fromDate,
                toDate,
                paid,
                companyCut: total - doctorCut - discountAmounts - medicalCenterCut,
                discountAmounts,
                total,
                doctorCut,
                medicalCenterCut,
                payable: Math.abs(payable),
                unsettledVisits
            };
        });
    }
    queryReports(type = 'user', fromDate = 0, toDate = Number.MAX_SAFE_INTEGER, skip, limit, search, whiteList) {
        return __awaiter(this, void 0, void 0, function* () {
            limit = Number.MAX_SAFE_INTEGER;
            let visits;
            const query = this.visitsRepo.crud();
            if (type === 'user') {
                query.where({ 'receipt.return_transaction_id': undefined, $or: [{ state: api_1.VisitStatus.ENDED }, { state: api_1.VisitStatus.CANCELLED }], $and: [{ end_date: { $gte: fromDate } }, { end_date: { $lte: toDate } }] });
                if (whiteList) {
                    (0, utils_1.addWhiteListFilter)(query, whiteList);
                }
                if (search && search !== '') {
                    if ((0, utils_1.isValidObjectId)(search)) {
                        query.orWhere({ doctor: (0, utils_1.ObjectId)(search) })
                            .orWhere({ patient: (0, utils_1.ObjectId)(search) });
                    }
                }
                visits = yield query
                    .project({ _id: 1, doctor: 1, receipt: 1, state: 1, end_date: 1 })
                    .populate([{ path: 'doctor', select: '_id name' }])
                    .findMany();
            }
            else {
                query.where({ 'receipt.healthCenterId': { $ne: undefined }, 'receipt.return_transaction_id': undefined, $or: [{ state: api_1.VisitStatus.ENDED }, { state: api_1.VisitStatus.CANCELLED }], $and: [{ end_date: { $gte: fromDate } }, { end_date: { $lte: toDate } }] });
                if (whiteList) {
                    (0, utils_1.addWhiteListFilter)(query, whiteList);
                }
                if (search && search !== '') {
                    if ((0, utils_1.isValidObjectId)(search)) {
                        query.orWhere({ 'receipt.healthCenterId': (0, utils_1.ObjectId)(search) });
                    }
                }
                visits = yield query
                    .project({ _id: 1, receipt: 1, state: 1, end_date: 1 })
                    .skip(skip)
                    .limit(limit)
                    .findMany();
            }
            console.log('found total of ' + visits.length);
            const res = {};
            const add = (user, visit) => {
                if (!user) {
                    return;
                }
                res[user._id] = res[user._id] || { name: user.name, total: 0, visits: [] };
                if (visit.receipt && visit.receipt.total) {
                    res[user._id].total += visit.receipt.total;
                }
                res[user._id].visits.push(visit);
            };
            for (const visit of visits) {
                if (type === 'user') {
                    add(visit.doctor, visit);
                }
                else {
                    add(visit.receipt.healthCenterId, visit);
                }
            }
            const total = Object.keys(res).length;
            const results = Object.keys(res).map((key) => {
                return Object.assign({ _id: key }, res[key]);
            });
            return (0, utils_1.generateQueryResponse)(total, results, skip, limit);
        });
    }
    queryAllAccountings(type = 'user', fromDate = 0, toDate = Number.MAX_SAFE_INTEGER, skip, limit, search, whiteList) {
        return __awaiter(this, void 0, void 0, function* () {
            let visits;
            const query = this.visitsRepo.crud();
            if (type === 'user') {
                query.where({ 'receipt.settled': false, 'receipt.return_transaction_id': undefined, state: api_1.VisitStatus.ENDED, $and: [{ end_date: { $gte: fromDate } }, { end_date: { $lte: toDate } }] });
                if (whiteList) {
                    (0, utils_1.addWhiteListFilter)(query, whiteList);
                }
                visits = yield query
                    .project({ _id: 1, doctor: 1, receipt: 1 })
                    .populate(['doctor'])
                    .findMany();
            }
            else {
                query.where({ 'receipt.healthCenterSettled': false, 'receipt.healthCenterId': { $ne: undefined }, 'receipt.return_transaction_id': undefined, state: api_1.VisitStatus.ENDED, $and: [{ end_date: { $gte: fromDate } }, { end_date: { $lte: toDate } }] });
                if (whiteList) {
                    (0, utils_1.addWhiteListFilter)(query, whiteList);
                }
                visits = yield query
                    .project({ _id: 1, receipt: 1 })
                    .populate(['receipt.healthCenterId'])
                    .findMany();
            }
            const res = {};
            const add = (user, visit) => {
                if (!user) {
                    return console.log('user or center not exists any more');
                }
                res[user._id] = res[user._id] || { name: user.name, payable: 0 };
                res[user._id].payable += (type === 'user' ? Number(visit.receipt.doctorCut) : Number(visit.receipt.healthCenterCut));
            };
            visits.forEach((visit) => {
                add(type === 'user' ? visit.doctor : visit.receipt.healthCenterId, visit);
            });
            const total = Object.keys(res).length;
            const results = Object.keys(res).map((key) => {
                return Object.assign({ _id: key }, res[key]);
            });
            return (0, utils_1.generateQueryResponse)(total, results, skip, Number.MAX_SAFE_INTEGER);
        });
    }
    applySettlement(adminId, targetId, visitIds, type, amount, details, trackingCode) {
        return __awaiter(this, void 0, void 0, function* () {
            let target;
            if (type === 'user') {
                target = yield this.usersRepo.crud().withId(targetId).findOne();
                yield this.visitsRepo.crud()
                    .where({ $or: visitIds.map(id => { return { _id: id }; }) })
                    .set({ $set: { 'receipt.settled': true } })
                    .updateMany();
            }
            else {
                target = yield this.healthCentersRepo.crud().withId(targetId).findOne();
                yield this.visitsRepo.crud()
                    .where({ $or: visitIds.map(id => { return { _id: id }; }) })
                    .set({ $set: { 'receipt.healthCenterSettled': true } })
                    .updateMany();
            }
            yield this.create({
                type: api_1.TransactionType.PAYROLL,
                amount,
                issuer: {
                    _id: adminId,
                    name: (yield this.adminsRepo.crud().withId(adminId).project({ name: 1 }).findOne()).name,
                    type: 'admin'
                },
                target: {
                    _id: target._id,
                    name: target.name
                },
                hint: details,
                trackingCode: trackingCode
            });
        });
    }
};
TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [transactions_repo_1.default, admins_repo_1.default, health_centers_repo_1.default, visits_repo_1.default, users_repo_1.default])
], TransactionsService);
exports.TransactionsService = TransactionsService;

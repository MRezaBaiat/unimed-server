"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
exports.VisitsService = void 0;
const common_1 = require("@nestjs/common");
const lock_service_1 = require("../lock/lock.service");
const visits_repo_1 = __importDefault(require("../../databases/visits.repo"));
const api_1 = require("api/");
const users_repo_1 = __importDefault(require("../../databases/users.repo"));
const clients_socket_service_1 = require("../socket/clients.socket.service");
const push_notification_service_1 = __importStar(require("../notifications/push.notification.service"));
const utils_1 = require("../../databases/utils");
const dictionary_1 = __importDefault(require("../../utils/dictionary"));
const discounts_service_1 = require("../discounts/discounts.service");
const sms_service_1 = __importDefault(require("../notifications/sms.service"));
const events_service_1 = __importDefault(require("../notifications/events.service"));
const health_centers_repo_1 = __importDefault(require("../../databases/health.centers.repo"));
const javascript_dev_kit_1 = require("javascript-dev-kit");
const discounts_repo_1 = __importDefault(require("../../databases/discounts.repo"));
const websockets_1 = require("@nestjs/websockets/");
const transactions_service_1 = require("../transactions/transactions.service");
let VisitsService = class VisitsService {
    constructor(lockService, healthCentersRepo, eventsService, discountsRepo, smsService, discountsService, notificationsService, socketService, transactionsService, visitsRepo, usersRepo) {
        this.lockService = lockService;
        this.healthCentersRepo = healthCentersRepo;
        this.eventsService = eventsService;
        this.discountsRepo = discountsRepo;
        this.smsService = smsService;
        this.discountsService = discountsService;
        this.notificationsService = notificationsService;
        this.socketService = socketService;
        this.transactionsService = transactionsService;
        this.visitsRepo = visitsRepo;
        this.usersRepo = usersRepo;
    }
    finalizeVisitForDoctor(userId, info, alreadyLocked) {
        const fn = () => __awaiter(this, void 0, void 0, function* () {
            const visit = yield this.visitsRepo.crud().withId(info.visit_id)
                .set({ state: api_1.VisitStatus.ENDED })
                .project({ patient: 1, doctor: 1, receipt: 1 })
                .populate(['patient', 'doctor'])
                .findOne();
            if (visit) {
                if (String(visit.doctor._id) !== String(userId)) {
                    console.log('doctors not match ' + userId + ' vs ' + visit.doctor._id);
                    return this.visitsRepo.findUserFinalizationsList(userId);
                }
                const user = yield this.usersRepo.crud()
                    .withId(userId)
                    .where({ type: api_1.UserType.DOCTOR, finalizable_visits: { $in: [String(info.visit_id)] } })
                    .project({ _id: 1 })
                    .findOne();
                if (info.return_cost && user) {
                    yield this.returnPaidAmount(info.visit_id, true);
                }
                console.log('sending status');
                yield this.socketService.sendStatus(visit.doctor._id);
            }
            yield this.usersRepo.removeWaitingForFinalization(userId, info.visit_id);
            return this.visitsRepo.findUserFinalizationsList(userId);
        });
        if (alreadyLocked) {
            return fn();
        }
        return this.lockService.lock(info.visit_id, (locked) => __awaiter(this, void 0, void 0, function* () {
            if (!locked) {
                return;
            }
            return fn();
        }));
    }
    visitRequested(patientUserid, doctorCode, discountCode) {
        return this.lockService.lock(patientUserid, (locked) => __awaiter(this, void 0, void 0, function* () {
            if (!locked) {
                return;
            }
            const { error } = yield this.checkVisitRequest(doctorCode, patientUserid, 'fa');
            if (error) {
                this.socketService.sendEvent(patientUserid, api_1.EventType.EVENT_ERROR, error);
                return;
            }
            const patient = yield this.usersRepo.crud().withId(patientUserid).project({ currency: 1, mobile: 1 }).findOne();
            const doctor = yield this.usersRepo.crud().where({ code: doctorCode }).project({ _id: 1, name: 1, details: 1 }).findOne();
            const { discountId, discountAmount } = yield this.discountsService.checkAndGet(patientUserid, discountCode, 'fa');
            error && console.log(error);
            if (patient.currency < doctor.price - (discountAmount || 0)) {
                return this.socketService.sendEvent(patientUserid, api_1.EventType.EVENT_ERROR, dictionary_1.default.Strings.CURRENCY_LOW.fa);
            }
            console.log('discount id setting' + discountId);
            this.smsService.sendSms('09900303910', 'ویزیت', 'call');
            this.smsService.sendSms('09121154048', 'ویزیت', 'call');
            this.smsService.sendSms('09900303913', 'ویزیت', 'call');
            this.smsService.sendSms('09900303919', 'ویزیت', 'call');
            yield this.visitsRepo.crud().create({
                state: api_1.VisitStatus.IN_QUEUE,
                discount: discountId,
                doctor: (0, utils_1.ObjectId)(doctor._id),
                patient: (0, utils_1.ObjectId)(patientUserid),
                chatting: false,
                maxDurationMillisec: doctor.details.maxVisitDurationMillisec
            });
            this.socketService.sendStatus(patientUserid, doctor._id);
            this.eventsService.notifyNewPatient(doctor._id);
            this.notifyQueues(doctor._id);
        }));
    }
    finalizeVisitForPatient(userId, info) {
        return __awaiter(this, void 0, void 0, function* () {
            const visit = yield this.visitsRepo.crud().withId(info.visitId)
                .where({ state: api_1.VisitStatus.ENDED })
                .project({ patient: 1, doctor: 1, receipt: 1 })
                .populate(['patient', 'doctor'])
                .findOne();
            if (visit) {
                if (String(visit.patient._id) !== String(userId)) {
                    console.log('patients did not match ', visit.patient._id, userId);
                    return this.visitsRepo.findUserFinalizationsList(userId);
                }
                const user = yield this.usersRepo.crud().withId(userId)
                    .where({ type: api_1.UserType.PATIENT, finalizable_visits: { $in: [String(info.visitId)] } })
                    .project({ _id: 1 })
                    .findOne();
                if (user) {
                    yield this.visitsRepo.crud().withId(info.visitId).set({ rating: info }).updateOne();
                }
            }
            yield this.usersRepo.removeWaitingForFinalization(userId, info.visitId);
            return this.visitsRepo.findUserFinalizationsList(userId);
        });
    }
    ;
    checkVisitRequest(doctorCode, patientUserId, lang) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = { currency: undefined, error: undefined };
            const patient = yield this.usersRepo.crud().withId(patientUserId)
                .project({ _id: 1, currency: 1 })
                .findOne();
            if (!patient) {
                res.error = dictionary_1.default.Strings.USER_NOT_FOUND[lang];
                return res;
            }
            res.currency = patient.currency;
            const statuses = yield this.socketService.getStatuses([patientUserId]);
            if (statuses.length === 0 || !statuses[0].isOnline) {
                res.error = dictionary_1.default.Strings.PATIENT_OFFLINE[lang];
                return res;
            }
            if (yield this.visitsRepo.findPatienceQueue(patient._id)) {
                res.error = dictionary_1.default.Strings.YOU_ARE_BUSY[lang];
                return res;
            }
            if (yield this.visitsRepo.findActiveVisit(patient._id)) {
                res.error = dictionary_1.default.Strings.USER_BUSY[lang];
                return res;
            }
            const doctor = yield this.usersRepo.crud()
                .where({ code: doctorCode })
                .project({ _id: 1, price: 1, name: 1, specialization: 1, ready: 1, 'details.response_days': 1 })
                .findOne();
            if (!doctor) {
                res.error = dictionary_1.default.Strings.DOCTOR_NOT_FOUND[lang];
                return res;
            }
            if (!doctor.ready) {
                this.usersRepo.addPatientToNotificationQueue(doctor._id, patient._id);
                res.error = dictionary_1.default.Strings.DOCTOR_UNAVAILABLE[lang] +
                    '\n' +
                    dictionary_1.default.Strings.doctor_response_days_is[lang](doctor.name) + '\n' +
                    api_1.Helper.createResponsiveDaysText(doctor.details.responseDays, lang);
                return res;
            }
            return Object.assign(Object.assign({}, res), { cost: doctor.price, name: doctor.name, specialization: doctor.specialization });
        });
    }
    returnPaidAmount(visitId, locked) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!locked) {
                return this.lockService.lock(visitId, (locked) => __awaiter(this, void 0, void 0, function* () {
                    if (!locked) {
                        return;
                    }
                    return this.returnPaidAmount(visitId, true);
                }));
            }
            const visit = yield this.visitsRepo.crud()
                .withId(visitId)
                .where({ state: api_1.VisitStatus.ENDED, 'receipt.return_transaction_id': null })
                .project({ patient: 1, doctor: 1, receipt: 1 })
                .populate(['patient', 'doctor'])
                .findOne();
            if (!visit) {
                console.log('no such visit');
                return;
            }
            const transaction = yield this.transactionsService.create({
                type: api_1.TransactionType.RETURN_VISIT_PAYMENT,
                amount: visit.receipt.paid,
                visitId: visitId,
                healthCenter: visit.receipt.healthCenterId,
                healthCenterCut: visit.receipt.healthCenterCut,
                issuer: {
                    _id: String(visit.doctor._id),
                    name: visit.doctor.mobile + '(' + visit.doctor.name + ')',
                    type: 'user'
                },
                target: {
                    _id: String(visit.patient._id),
                    name: visit.patient.mobile + '(' + visit.patient.name + ')'
                }
            });
            yield this.visitsRepo.crud().withId(visitId)
                .set({ 'receipt.return_transaction_id': transaction._id })
                .updateOne();
            yield this.usersRepo.removeWaitingForFinalization(visit.doctor._id, visitId);
            yield this.notificationsService.sendNotification(visit.patient._id, push_notification_service_1.NOTIFICATION_TYPES.DOCTOR_RETURNED_PAYMENT(visit.doctor.name)).catch(console.error);
            yield this.socketService.sendStatus(visit.doctor._id);
        });
    }
    ;
    acceptVisit(visitId, requesterId) {
        return this.lockService.lock(visitId, (locked) => __awaiter(this, void 0, void 0, function* () {
            if (!locked) {
                return;
            }
            const visit = yield this.visitsRepo.crud().withId(visitId)
                .where({ state: api_1.VisitStatus.IN_QUEUE })
                .project({ _id: 1, patient: 1, doctor: 1 })
                .findOne();
            if (!visit) {
                return this.socketService.sendStatus(requesterId);
            }
            if (yield this.visitsRepo.findActiveVisit(String(visit.doctor))) {
                return this.socketService.sendStatus(requesterId);
            }
            const { error } = yield this.startVisit(visitId);
            if (error) {
                console.log('could not start visit because ', error);
                this.socketService.sendEvent(String(visit.patient), api_1.EventType.EVENT_ERROR, error);
                return this.endVisit(visitId, false);
            }
            this.socketService.sendStatus(String(visit.patient), String(visit.doctor));
            this.notificationsService.sendNotification(String(visit.patient), push_notification_service_1.NOTIFICATION_TYPES.VISIT_STARTED);
            this.notifyQueues(String(visit.doctor));
        }));
    }
    ;
    startVisit(visitId) {
        return __awaiter(this, void 0, void 0, function* () {
            const visit = yield this.visitsRepo.crud()
                .withId(visitId)
                .where({ state: api_1.VisitStatus.IN_QUEUE })
                .project({ _id: 1, patient: 1, doctor: 1, discount: 1 })
                .populate(['doctor', 'patient', 'discount'])
                .findOne();
            if (!visit) {
                return { error: 'Visit was not found !' };
            }
            const coupon = visit.discount;
            const patient = visit.patient;
            const doctor = visit.doctor;
            const responseTime = yield this.usersRepo.getDoctorCurrentResponseTime(doctor._id);
            if (coupon) {
                coupon.amount = coupon.amount > doctor.price ? doctor.price : coupon.amount;
            }
            const total = doctor.price;
            let payable = total - (coupon ? coupon.amount : 0);
            payable = payable < 0 ? 0 : payable;
            if (patient.currency < payable) {
                return { error: 'موجودی حساب شما کم است' };
            }
            const healthCenterPercentage = responseTime && responseTime.healthCenter ? (yield this.healthCentersRepo.crud().withId(responseTime.healthCenter._id).findOne()).percentage : undefined;
            const healthCenterCut = healthCenterPercentage ? ((total - Number(doctor.details.cut)) * healthCenterPercentage) / 100 : 0;
            let transaction = {
                discount: total - payable,
                amount: payable,
                doctorCut: Number(doctor.details.cut),
                healthCenter: responseTime && responseTime.healthCenter && responseTime.healthCenter._id,
                healthCenterCut,
                target: {
                    _id: doctor._id,
                    name: doctor.name
                },
                issuer: {
                    _id: patient._id,
                    name: patient.mobile,
                    type: 'user'
                },
                visitId: visit._id,
                type: api_1.TransactionType.VISIT_PAYMENT
            };
            try {
                transaction = yield this.transactionsService.create(transaction);
            }
            catch (e) {
                console.log(e);
                return { error: e };
            }
            const receipt = {
                discount: coupon ? coupon.amount : 0,
                paid: payable,
                total,
                healthCenterId: responseTime && responseTime.healthCenter && responseTime.healthCenter._id,
                healthCenterCut,
                doctorCut: Number(doctor.details.cut),
                transaction_id: transaction._id
            };
            yield this.visitsRepo.crud().withId(visitId)
                .set({ state: api_1.VisitStatus.STARTED, start_date: new Date().getTime(), startDateUTC: (0, javascript_dev_kit_1.smartDate)().toISOString(), receipt })
                .updateOne();
            if (coupon) {
                yield this.discountsRepo.couponUsedBy(coupon._id, patient._id);
            }
            return { error: undefined };
        });
    }
    endVisit(visitId, returnMoney) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.lockService.lock(visitId, (locked) => __awaiter(this, void 0, void 0, function* () {
                if (!locked) {
                    return;
                }
                const visit = yield this.visitsRepo.crud().withId(visitId).findOne();
                if (visit) {
                    if (visit.state === api_1.VisitStatus.IN_QUEUE) {
                        yield this.visitsRepo.crud().withId(visitId).set({ state: api_1.VisitStatus.CANCELLED, end_date: new Date().getTime() }).updateOne();
                    }
                    else if (visit.state === api_1.VisitStatus.STARTED) {
                        yield this.visitsRepo.crud().withId(visitId).set({ state: api_1.VisitStatus.ENDED, end_date: new Date().getTime() }).updateOne();
                        yield this.usersRepo.addWaitingForFinalization(String(visit.patient), visitId);
                        yield this.usersRepo.addWaitingForFinalization(String(visit.doctor), visitId);
                    }
                    else {
                        console.log('visit status was ' + visit.state);
                    }
                    this.socketService.sendStatus(String(visit.patient), String(visit.doctor));
                    this.socketService.sendFinalizableVisits(String(visit.patient));
                    this.socketService.sendFinalizableVisits(String(visit.doctor));
                    this.notifyQueues(String(visit.doctor));
                    if (returnMoney) {
                        yield this.finalizeVisitForDoctor(visit.doctor._id, { visit_id: visit._id, return_cost: returnMoney }, true);
                    }
                }
            }));
        });
    }
    notifyQueues(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const visitRequests = yield this.visitsRepo.crud()
                .where({ doctor: (0, utils_1.ObjectId)(doctorId), state: api_1.VisitStatus.IN_QUEUE })
                .project({ _id: 1, patient: 1 })
                .findMany();
            for (let i = 0; i < visitRequests.length; i++) {
                const patient = visitRequests[i].patient;
                this.socketService.sendEvent(String(patient), 'queue_update', { queue: i + 1, estimated: (i + 1) * 15 });
            }
        });
    }
    ;
    sendMessage(senderId, targetId, chat, senderUserType) {
        return __awaiter(this, void 0, void 0, function* () {
            chat.sendStatus = api_1.SendStatus.SENT;
            const visit = yield this.visitsRepo.crud().withId(targetId)
                .where({ state: api_1.VisitStatus.STARTED })
                .project({ patient: 1, doctor: 1 })
                .findOne();
            if (!visit) {
                console.log('will not send message because the visit was not found');
                return;
            }
            this.visitsRepo.addChat(visit._id, chat, [senderId], senderUserType);
            const members = [String(visit.patient), String(visit.doctor)];
            for (const userId of members) {
                if (userId === senderId) {
                    continue;
                }
                this.socketService.sendMessage(userId, senderId, targetId, chat);
            }
        });
    }
};
VisitsService = __decorate([
    (0, common_1.Injectable)(),
    (0, websockets_1.WebSocketGateway)(7070, { path: '/live', transports: ['websocket'], namespace: '/' }),
    __metadata("design:paramtypes", [lock_service_1.LockService, health_centers_repo_1.default, events_service_1.default, discounts_repo_1.default, sms_service_1.default, discounts_service_1.DiscountsService, push_notification_service_1.default, clients_socket_service_1.ClientsSocketService, transactions_service_1.TransactionsService, visits_repo_1.default, users_repo_1.default])
], VisitsService);
exports.VisitsService = VisitsService;

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
exports.TimerService = void 0;
const common_1 = require("@nestjs/common");
const users_repo_1 = __importDefault(require("../../databases/users.repo"));
const api_1 = require("api");
const clients_socket_service_1 = require("../socket/clients.socket.service");
const events_service_1 = __importDefault(require("../notifications/events.service"));
const push_notification_service_1 = __importStar(require("../notifications/push.notification.service"));
const schedule_1 = require("@nestjs/schedule");
const gateway_service_1 = require("../gateway/gateway.service");
let TimerService = class TimerService {
    constructor(usersRepo, gatewayService, socketService, eventsService, notificationsService) {
        this.usersRepo = usersRepo;
        this.gatewayService = gatewayService;
        this.socketService = socketService;
        this.eventsService = eventsService;
        this.notificationsService = notificationsService;
        this.autoModified = [];
        this.lastNotified = [];
    }
    checkGateways() {
        this.gatewayService.checkUnverifiedTransactions().then((res) => {
        });
    }
    checkWorkTimes() {
        return __awaiter(this, void 0, void 0, function* () {
            const doctors = yield this.usersRepo.crud().where({ type: api_1.UserType.DOCTOR }).project({ _id: 1, name: 1, mobile: 1, code: 1, ready: 1, 'details.response_days': 1, notificationQueuePatients: 1 }).findMany();
            for (const doctor of doctors) {
                try {
                    const isWorkingTime = (yield this.usersRepo.getDoctorCurrentResponseTime(doctor._id)) !== undefined;
                    if (isWorkingTime) {
                        if (this.autoModified.indexOf(doctor._id) < 0) {
                            this.autoModified.push(doctor._id);
                        }
                        if (!doctor.ready) {
                            console.log('auto started doctor ' + doctor._id);
                            yield this.usersRepo.setReadyState(doctor._id, true);
                            yield this.socketService.sendStatus(doctor._id);
                            this.eventsService.notifyWorkTimeStarted(doctor._id);
                        }
                    }
                    else {
                        if (this.autoModified.indexOf(doctor._id) !== -1) {
                            this.autoModified.splice(this.autoModified.indexOf(doctor._id), 1);
                        }
                        if (doctor.ready) {
                            console.log('auto ended doctor ' + doctor._id);
                            yield this.usersRepo.setReadyState(doctor._id, false);
                            yield this.socketService.sendStatus(doctor._id);
                            this.eventsService.notifyWorkTimeEnded(doctor._id);
                        }
                        const responseTime = yield this.usersRepo.getDoctorCurrentResponseTime(doctor._id, 10 * 60 * 1000);
                        if (responseTime) {
                            if (!this.lastNotified[doctor._id] || Date.now() - this.lastNotified[doctor._id] > 30 * 60 * 1000) {
                                this.lastNotified[doctor._id] = Date.now();
                                this.eventsService.notifyWorkTimeClose(doctor._id);
                            }
                        }
                        const notificationQueuePatients = doctor.notificationQueuePatients;
                        if (notificationQueuePatients && notificationQueuePatients.length !== 0) {
                            const responseTime = yield this.usersRepo.getDoctorCurrentResponseTime(doctor._id, 1 * 60 * 60 * 1000);
                            if (responseTime) {
                                const minutes = Math.round(responseTime.diff / 1000 / 60);
                                notificationQueuePatients.forEach((patientId) => {
                                    this.notificationsService.sendNotification(patientId, push_notification_service_1.NOTIFICATION_TYPES.FREE_TEXT_FNC('', `${doctor.name} تا ${minutes} دقیقه دیگر آنلاین می شوند`, ''));
                                    this.usersRepo.removePatientOfNotificationQueue(doctor._id, patientId);
                                });
                            }
                        }
                    }
                }
                catch (e) {
                    console.log(e);
                }
            }
            console.log('timer check finished');
        });
    }
};
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_30_SECONDS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TimerService.prototype, "checkGateways", null);
__decorate([
    (0, schedule_1.Cron)('0 */2 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TimerService.prototype, "checkWorkTimes", null);
TimerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_repo_1.default, gateway_service_1.GatewayService, clients_socket_service_1.ClientsSocketService, events_service_1.default, push_notification_service_1.default])
], TimerService);
exports.TimerService = TimerService;

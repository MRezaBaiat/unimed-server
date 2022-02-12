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
const common_1 = require("@nestjs/common");
const push_notification_service_1 = __importStar(require("./push.notification.service"));
const sms_service_1 = __importDefault(require("./sms.service"));
const users_service_1 = require("../users/users.service");
const users_repo_1 = __importDefault(require("../../databases/users.repo"));
let EventsService = class EventsService {
    constructor(usersService, usersRepo, pushService, smsService) {
        this.usersService = usersService;
        this.usersRepo = usersRepo;
        this.pushService = pushService;
        this.smsService = smsService;
    }
    notifyNewPatient(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const settings = yield this.usersService.getNotificationSettings(doctorId);
            if (settings.newPatient.notification) {
                console.log('notifyNewPatient().notification');
                this.pushService.sendNotification(doctorId, push_notification_service_1.NOTIFICATION_TYPES.NEW_PATIENT);
            }
            if (settings.newPatient.sms) {
                console.log('notifyNewPatient().sms');
                const user = yield this.usersRepo.crud().withId(doctorId).project({ mobile: 1 }).findOne();
                this.smsService.sendDirect(user.mobile, push_notification_service_1.NOTIFICATION_TYPES.NEW_PATIENT.title);
            }
        });
    }
    notifyWorkTimeStarted(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const settings = yield this.usersService.getNotificationSettings(doctorId);
            if (settings.workTimeStarted.notification) {
                console.log('notifyWorkTimeStarted().notification');
                this.pushService.sendNotification(doctorId, push_notification_service_1.NOTIFICATION_TYPES.RESPONSE_TIME_STARTED);
            }
            if (settings.workTimeStarted.sms) {
                console.log('notifyWorkTimeStarted().sms');
                const user = yield this.usersRepo.crud().withId(doctorId).project({ mobile: 1 }).findOne();
                console.log(user.mobile);
                this.smsService.sendDirect(user.mobile, push_notification_service_1.NOTIFICATION_TYPES.RESPONSE_TIME_STARTED.title);
            }
        });
    }
    notifyWorkTimeClose(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const settings = yield this.usersService.getNotificationSettings(doctorId);
            if (settings.workTimeClose.notification) {
                console.log('notifyWorkTimeClose().notification');
                this.pushService.sendNotification(doctorId, push_notification_service_1.NOTIFICATION_TYPES.WORK_TIME_CLOSE);
            }
            if (settings.workTimeClose.sms) {
                console.log('notifyWorkTimeClose().sms');
                const user = yield this.usersRepo.crud().withId(doctorId).project({ mobile: 1, code: 1 }).findOne();
                this.smsService.sendSms(user.mobile, String(user.code), 'worktime');
            }
        });
    }
    notifyWorkTimeEnded(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const settings = yield this.usersService.getNotificationSettings(doctorId);
            if (settings.workTimeEnded.notification) {
                console.log('notifyWorkTimeEnded().notification');
                this.pushService.sendNotification(doctorId, push_notification_service_1.NOTIFICATION_TYPES.RESPONSE_TIME_ENDED);
            }
            if (settings.workTimeEnded.sms) {
                console.log('notifyWorkTimeEnded().sms');
                const user = yield this.usersRepo.crud().withId(doctorId).project({ mobile: 1 }).findOne();
                this.smsService.sendDirect(user.mobile, push_notification_service_1.NOTIFICATION_TYPES.RESPONSE_TIME_ENDED.title);
            }
        });
    }
    notifyPatientOfNewReservation(patientMobile, patientName) {
        return __awaiter(this, void 0, void 0, function* () {
            this.smsService.sendSms(patientMobile, patientName, 'new-reservation-target-patient');
        });
    }
    notifyDoctorOfNewReservation(doctorMobile, doctorName) {
        return __awaiter(this, void 0, void 0, function* () {
            this.smsService.sendSms(doctorMobile, doctorName, 'new-reservation-target-doctor');
        });
    }
};
EventsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService, users_repo_1.default, push_notification_service_1.default, sms_service_1.default])
], EventsService);
exports.default = EventsService;

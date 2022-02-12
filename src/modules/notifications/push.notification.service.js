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
exports.NOTIFICATION_TYPES = void 0;
const common_1 = require("@nestjs/common");
const notifications_repo_1 = __importDefault(require("../../databases/notifications.repo"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const google_services_json_1 = __importDefault(require("./google-services.json"));
const utils_1 = require("../../databases/utils");
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(google_services_json_1.default),
    databaseURL: 'https://matap-test.firebaseio.com'
});
exports.NOTIFICATION_TYPES = {
    FREE_TEXT_FNC: (title, body, link) => {
        return {
            channelId: 'default',
            soundName: 'default',
            title: title,
            link: link,
            body: body,
            ignoreInForeground: false
        };
    },
    NEW_PATIENT: {
        title: 'یک بیمار جدید در صف انتظار است',
        channelId: 'patient-in-queue',
        soundName: 'voice_mode_2.mp3',
        ignoreInForeground: false
    },
    VISIT_STARTED: {
        title: 'ویزیت شما شروع شد',
        channelId: 'visit-started',
        soundName: 'voice_mode_1.mp3',
        ignoreInForeground: false
    },
    RESPONSE_TIME_STARTED: {
        title: 'وضعیت شما به حالت فعال تغییر کرد',
        channelId: 'default',
        soundName: 'default',
        ignoreInForeground: false
    },
    RESPONSE_TIME_ENDED: {
        title: 'وضعیت شما به حالت غیر فعال تغییر کرد',
        channelId: 'default',
        soundName: 'default',
        ignoreInForeground: false
    },
    WORK_TIME_CLOSE: {
        title: 'با سلام، ساعت کار مطپ شما نزدیک است',
        channelId: 'default',
        soundName: 'default',
        ignoreInForeground: false
    },
    DOCTOR_RETURNED_PAYMENT: (doctorName) => {
        return {
            title: `هزینه ویزیت شما توسط ${doctorName} بازگشت داده شد`,
            channelId: 'default',
            soundName: 'default',
            ignoreInForeground: false
        };
    }
};
let PushNotificationService = class PushNotificationService {
    constructor(notificationsRepo) {
        this.notificationsRepo = notificationsRepo;
    }
    sendNotification(userId, notification, priority = 'high') {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    query(skip, limit, search, whiteList) {
        return __awaiter(this, void 0, void 0, function* () {
            const condition = this.notificationsRepo.crud();
            whiteList && (0, utils_1.addWhiteListFilter)(condition, whiteList);
            return condition
                .project({ __v: 0 })
                .populate(['sender'])
                .skip(skip)
                .limit(limit)
                .query();
        });
    }
    ;
    sendToAll(title, body, link, adminId) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = (yield this.notificationsRepo.crud().create({
                title,
                body,
                link,
                date: Date.now(),
                state: 'SENDING',
                sender: adminId,
                successCount: 0
            }))._id;
            const notification = exports.NOTIFICATION_TYPES.FREE_TEXT_FNC(title, body, link);
            firebase_admin_1.default.messaging().sendToTopic('all-devices', this.generatePayload(notification), {
                contentAvailable: true,
                priority: 'high'
            }).then((response) => {
                console.log('Success count : ' + response.successCount);
                this.notificationsRepo.crud().withId(id)
                    .set({ state: 'DONE', successCount: response.successCount || 0 })
                    .updateOne();
                return {
                    successCount: response.successCount || 0
                };
            }).catch((error) => {
                console.log('Error sending message:', error);
                this.notificationsRepo.crud().withId(id)
                    .set({ state: 'FAILED' })
                    .updateOne();
                return {
                    successCount: 0
                };
            });
        });
    }
    ;
    generatePayload(notification) {
        return {
            notification: {
                android_channel_id: notification.channelId,
                title: notification.title,
                body: notification.body || '',
                tag: 'Matap',
                sound: notification.soundName,
                badge: '0'
            },
            data: {
                notification: JSON.stringify({
                    title: notification.title,
                    message: notification.body || '',
                    channelId: notification.channelId,
                    link: notification.link,
                    soundName: notification.soundName,
                    ignoreInForeground: notification.ignoreInForeground,
                    playSound: true,
                    vibrate: true,
                    priority: 'max',
                    invokeApp: true,
                    tag: 'Matap',
                    badge: 0,
                    playOnForeground: true
                })
            }
        };
    }
    ;
};
PushNotificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notifications_repo_1.default])
], PushNotificationService);
exports.default = PushNotificationService;

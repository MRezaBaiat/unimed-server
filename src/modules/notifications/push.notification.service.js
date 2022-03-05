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
const common_1 = require("@nestjs/common");
const notifications_repo_1 = __importDefault(require("../../databases/notifications.repo"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const google_services_json_1 = __importDefault(require("./google-services.json"));
const utils_1 = require("../../databases/utils");
const users_repo_1 = __importDefault(require("../../databases/users.repo"));
const notifications_1 = require("./notifications");
const utils_2 = require("../../utils");
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(google_services_json_1.default),
    databaseURL: 'https://unimed.firebaseio.com'
});
let PushNotificationService = class PushNotificationService {
    constructor(notificationsRepo, usersRepo) {
        this.notificationsRepo = notificationsRepo;
        this.usersRepo = usersRepo;
    }
    sendNotification(userId, notification, priority = 'high') {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.usersRepo.crud().withId(userId)
                .project({ fcmtoken: 1, mobile: 1 })
                .findOne();
            if (!user || !user.fcmtoken) {
                console.log('push notification', 'user not found ' + userId + ' , or he did not have a fcm token set');
                return;
            }
            console.log('push notification', 'sending push');
            firebase_admin_1.default.messaging().sendToDevice([user.fcmtoken], this.generatePayload(notification, (0, utils_2.findLanguageFromMobile)(user.mobile)), {
                contentAvailable: true,
                priority
            })
                .then((response) => {
                console.log('Successfully sent message:', response);
            })
                .catch((error) => {
                console.log('Error sending message:', error);
            });
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
            const notification = new notifications_1.GeneralNotification(title, body, link);
            firebase_admin_1.default.messaging().sendToTopic('all-devices', this.generatePayload(notification, 'fa'), {
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
    generatePayload(notification, language) {
        const props = notification.getNotificationProps(language);
        return {
            notification: {
                android_channel_id: props.channelId,
                title: props.title,
                body: props.body || '',
                tag: 'Unimed',
                sound: props.soundName,
                badge: '0'
            },
            data: {
                notification: JSON.stringify({
                    title: props.title,
                    message: props.body || '',
                    channelId: props.channelId,
                    link: props.link,
                    soundName: props.soundName,
                    ignoreInForeground: props.ignoreInForeground,
                    playSound: true,
                    vibrate: true,
                    priority: 'max',
                    invokeApp: true,
                    tag: 'Unimed',
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
    __metadata("design:paramtypes", [notifications_repo_1.default, users_repo_1.default])
], PushNotificationService);
exports.default = PushNotificationService;

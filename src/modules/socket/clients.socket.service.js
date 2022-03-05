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
exports.ClientsSocketService = void 0;
const common_1 = require("@nestjs/common");
const api_1 = require("api");
const lock_service_1 = require("../lock/lock.service");
const auth_service_1 = require("../auth/auth.service");
const users_repo_1 = __importDefault(require("../../databases/users.repo"));
const index_1 = require("./index");
const visits_repo_1 = __importDefault(require("../../databases/visits.repo"));
let ClientsSocketService = class ClientsSocketService {
    constructor(lockService, visitsRepo, authService, usersRepo) {
        this.lockService = lockService;
        this.visitsRepo = visitsRepo;
        this.authService = authService;
        this.usersRepo = usersRepo;
    }
    deleteSession(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sockets = yield global.io().sockets.in((0, index_1.createUserRoomId)(userId)).fetchSockets();
            sockets.forEach(s => s.disconnect());
        });
    }
    sendMessage(userId, senderId, roomId, object) {
        return __awaiter(this, void 0, void 0, function* () {
            global.io().in((0, index_1.createUserRoomId)(userId)).emit('message', senderId, roomId, object);
        });
    }
    sendStatus(...userIds) {
        userIds.forEach((userId) => __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.isOnline(userId))) {
                console.log('not online to send status', userId);
                return;
            }
            const user = yield this.usersRepo.crud().withId(userId).project({ type: 1, ready: 1 }).findOne();
            const visit = yield this.visitsRepo.findActiveVisit(userId);
            if (visit) {
            }
            if (user.type === api_1.UserType.PATIENT) {
                const status = {
                    visit: visit || (yield this.visitsRepo.findPatienceQueue(userId))
                };
                this.sendEvent(userId, api_1.EventType.EVENT_STATUS_UPDATE, status);
            }
            else {
                const status = {
                    visit,
                    ready: user.ready,
                    queueList: yield this.visitsRepo.getDoctorQueueList(userId)
                };
                this.sendEvent(userId, api_1.EventType.EVENT_STATUS_UPDATE, status);
            }
        }));
    }
    isOnline(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const map = global.io().of('/').adapter.rooms.get((0, index_1.createUserRoomId)(userId));
            return map ? map.size > 0 : false;
        });
    }
    getStatuses(ids) {
        return __awaiter(this, void 0, void 0, function* () {
            const statuses = [];
            for (const id of ids) {
                statuses.push({
                    _id: id,
                    isOnline: yield this.isOnline(id)
                });
            }
            return statuses;
        });
    }
    sendEvent(userId, eventName, data, roomId) {
        global.io().in((0, index_1.createUserRoomId)(userId)).emit(eventName, roomId, data);
    }
    sendFinalizableVisits(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.isOnline(userId))) {
                return;
            }
            const finalizableVisits = yield this.visitsRepo.findUserFinalizationsList(userId);
            this.sendEvent(userId, 'finalizable_visits', finalizableVisits);
        });
    }
    signalCall(offer) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.isOnline(offer.receiver.id)) || !(yield this.isOnline(offer.initiator.id))) {
                console.log('both of clients need to be online');
                return undefined;
            }
            offer.videoCallVersion = '2';
            console.log('call from ' + offer.initiator.id + ' to ' + offer.receiver.id);
            setImmediate(() => {
                this.sendEvent(offer.receiver.id, api_1.EventType.EVENT_CALL_REQUEST, offer);
            });
            return offer;
        });
    }
};
ClientsSocketService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [lock_service_1.LockService, visits_repo_1.default, auth_service_1.AuthService, users_repo_1.default])
], ClientsSocketService);
exports.ClientsSocketService = ClientsSocketService;

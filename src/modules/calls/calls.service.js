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
exports.CallsService = void 0;
const common_1 = require("@nestjs/common");
const api_1 = require("api");
const calls_repo_1 = __importDefault(require("../../databases/calls.repo"));
const clients_socket_service_1 = require("../socket/clients.socket.service");
const users_repo_1 = __importDefault(require("../../databases/users.repo"));
const server_configs_repo_1 = __importDefault(require("../../databases/server.configs.repo"));
const visits_repo_1 = __importDefault(require("../../databases/visits.repo"));
const utils_1 = require("../../databases/utils");
const javascript_dev_kit_1 = require("javascript-dev-kit/");
let CallsService = class CallsService {
    constructor(callsRepo, socketService, visitsRepo, usersRepo, serverConfigsRepo) {
        this.callsRepo = callsRepo;
        this.socketService = socketService;
        this.visitsRepo = visitsRepo;
        this.usersRepo = usersRepo;
        this.serverConfigsRepo = serverConfigsRepo;
    }
    query(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { skip, limit, sort, populations, projection, search, userId, from, to } = query;
            const condition = this.callsRepo.crud();
            if (search && search !== '') {
                condition.whereTextLike({ 'initiator.name': search }, 'or')
                    .whereTextLike({ 'receiver.name': search }, 'or')
                    .whereTextLike({ 'initiator.mobile': search }, 'or')
                    .whereTextLike({ 'receiver.mobile': search }, 'or')
                    .whereTextLike({ visitId: search }, 'or');
            }
            if (from && to) {
                condition.andWhere({ createdAt: { $gte: Number(from) } })
                    .andWhere({ createdAt: { $lte: Number(to) } });
            }
            if (userId && userId !== '') {
                condition.orWhere({ 'initiator.id': userId })
                    .orWhere({ 'receiver.id': userId });
            }
            return condition
                .skip(skip)
                .limit(limit)
                .project(projection || { events: 0 })
                .sort(sort || { createdAt: -1 })
                .query();
        });
    }
    hangUpCall(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const conference = yield this.callsRepo.crud().where({ id }).project({ id: 1, initiator: 1, receiver: 1 }).findOne();
            if (conference) {
                yield this.callsRepo.crud().where({ id }).set({ state: 'ended', endedAt: (0, javascript_dev_kit_1.smartDate)().toISOString() }).updateOne();
                this.socketService.sendEvent(conference.initiator.id, api_1.EventType.EVENT_CALL_ENDED, conference.id);
                this.socketService.sendEvent(conference.receiver.id, api_1.EventType.EVENT_CALL_ENDED, conference.id);
            }
        });
    }
    declineCall(id, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            const conference = yield this.callsRepo.crud().where({ id }).project({ id: 1, initiator: 1, receiver: 1 }).findOne();
            if (conference) {
                yield this.callsRepo.crud().where({ id }).set({ state: 'ended', endedAt: (0, javascript_dev_kit_1.smartDate)().toISOString() }).updateOne();
                yield this.socketService.sendEvent(conference.initiator.id, api_1.EventType.EVENT_CALL_DECLINED, conference.id);
                yield this.socketService.sendEvent(conference.initiator.id, api_1.EventType.EVENT_CALL_DECLINED, { id: conference.id, reason });
            }
        });
    }
    acceptCall(id, deviceInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            const conference = yield this.callsRepo.crud().where({ id, state: 'initiating' }).project({ events: 0 }).findOne();
            if (conference) {
                yield this.callsRepo.crud().where({ id }).set({ state: 'transmitting', 'receiver.deviceInfo': deviceInfo }).updateOne();
                yield this.socketService.sendEvent(conference.initiator.id, api_1.EventType.EVENT_CALL_ACCEPTED, conference);
                return true;
            }
            return false;
        });
    }
    initiateCall(initiatorId, type, deviceInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            const requesterUser = yield this.usersRepo.crud().withId(initiatorId).project({ type: 1, name: 1, _id: 1, mobile: 1 }).findOne();
            const serverConfigs = yield this.serverConfigsRepo.getConfigs();
            if (type !== api_1.ConferenceType.video_audio) {
                serverConfigs.mediaConstraints.video = false;
            }
            const initiator = {
                id: String(requesterUser._id),
                name: requesterUser.name,
                state: api_1.ParticipantState.connecting,
                userType: requesterUser.type,
                mobile: requesterUser.mobile,
                deviceInfo
            };
            let visit;
            let receiverUser;
            if (requesterUser.type === api_1.UserType.DOCTOR) {
                visit = yield this.visitsRepo.crud().where({ doctor: (0, utils_1.ObjectId)(initiator.id), state: api_1.VisitStatus.STARTED })
                    .project({ _id: 1, patient: 1, doctor: 1 })
                    .findOne();
                if (!visit) {
                    return undefined;
                }
                receiverUser = yield this.usersRepo.crud().withId(String(visit.patient)).project({ type: 1, name: 1, _id: 1, mobile: 1 }).findOne();
            }
            else {
                visit = yield this.visitsRepo.crud().where({ patient: (0, utils_1.ObjectId)(initiator.id), state: api_1.VisitStatus.STARTED }).project({ _id: 1, patient: 1, doctor: 1 }).findOne();
                if (!visit) {
                    return undefined;
                }
                receiverUser = yield this.usersRepo.crud().withId(String(visit.doctor)).project({ type: 1, name: 1, _id: 1, mobile: 1 }).findOne();
            }
            const receiver = {
                id: String(receiverUser._id),
                name: receiverUser.name,
                state: api_1.ParticipantState.connecting,
                userType: receiverUser.type,
                mobile: receiverUser.mobile
            };
            let session = new api_1.Conference(String(visit._id), process.env.PUBLIC_URL, type, undefined, serverConfigs, initiator, receiver);
            session.state = 'initiating';
            session = yield this.socketService.signalCall(session);
            if (!session) {
                return session;
            }
            return this.callsRepo.crud().create(session);
        });
    }
};
CallsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [calls_repo_1.default, clients_socket_service_1.ClientsSocketService, visits_repo_1.default, users_repo_1.default, server_configs_repo_1.default])
], CallsService);
exports.CallsService = CallsService;

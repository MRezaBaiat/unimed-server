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
const websockets_1 = require("@nestjs/websockets/");
const index_1 = require("./index");
const socket_io_1 = require("socket.io");
const api_1 = require("api/");
const clients_socket_service_1 = require("./clients.socket.service");
const auth_service_1 = require("../auth/auth.service");
const users_repo_1 = __importDefault(require("../../databases/users.repo"));
const common_1 = require("@nestjs/common/");
const visits_service_1 = require("../visits/visits.service");
const userid_decorator_1 = __importDefault(require("../../decorators/userid.decorator"));
const visits_repo_1 = __importDefault(require("../../databases/visits.repo"));
const calls_repo_1 = __importDefault(require("../../databases/calls.repo"));
const javascript_dev_kit_1 = require("javascript-dev-kit/");
let WebsocketsExceptionFilter = class WebsocketsExceptionFilter extends websockets_1.BaseWsExceptionFilter {
    catch(exception, ctx) {
        console.log(exception.message);
        console.log(exception);
    }
};
WebsocketsExceptionFilter = __decorate([
    (0, common_1.Catch)(Error, websockets_1.WsException)
], WebsocketsExceptionFilter);
let ClientsGateway = class ClientsGateway {
    constructor(socketService, callsRepo, visitsRepo, authService, usersRepo, visitsService) {
        this.socketService = socketService;
        this.callsRepo = callsRepo;
        this.visitsRepo = visitsRepo;
        this.authService = authService;
        this.usersRepo = usersRepo;
        this.visitsService = visitsService;
    }
    afterInit({ server }) {
        if (global.io) {
            throw new Error('socket service instantiated twice');
        }
        global.io = () => server;
    }
    handleDisconnect(socket) {
        if (socket.userProps) {
            socket.leave((0, index_1.createUserRoomId)(socket.userProps.userid));
        }
    }
    handleConnection(socket, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('new socket connection');
                const token = socket.handshake.query.authorization;
                const videoCallVersion = Number(socket.handshake.query.videoCallVersion || 1);
                const res = yield this.authService.decode(token);
                if (!res || !res.userid) {
                    console.log('auth error 1');
                    return socket.disconnect(true);
                }
                console.log('socket userid ', res.userid);
                const user = yield this.usersRepo.crud().withId(res.userid).project({ _id: 1, type: 1, os: 1, mobile: 1 }).findOne();
                if (!user) {
                    console.log('auth error 2');
                    return socket.disconnect(true);
                }
                socket.userProps = {
                    userid: String(user._id),
                    os: user.os,
                    type: user.type,
                    mobile: user.mobile,
                    videoCallVersion: videoCallVersion
                };
                socket.join((0, index_1.createUserRoomId)(socket.userProps.userid));
                console.log('1');
                this.socketService.sendStatus(user._id);
                console.log('2');
                let activeVisit = yield this.visitsRepo.findActiveVisit(user._id);
                console.log('3');
                if (activeVisit) {
                    console.log('4');
                    activeVisit = yield this.visitsRepo.crud().withId(activeVisit._id).project({ conversations: 1, _id: 1 }).findOne();
                    this.socketService.sendEvent(user._id, 'conversations', activeVisit.conversations.map(c => c.chat), activeVisit._id);
                }
                else {
                    console.log('5');
                    const queueVisit = yield this.visitsRepo.findPatienceQueue(user._id);
                    if (queueVisit) {
                        console.log('6');
                        this.visitsService.notifyQueues(String(queueVisit.doctor._id));
                    }
                }
                console.log('7');
                yield this.socketService.sendFinalizableVisits(user._id);
                socket.emit('authenticated');
            }
            catch (e) {
                console.log(e);
                socket.disconnect(true);
            }
        });
    }
    handleRequestVisit(client, packet, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            this.visitsService.visitRequested(userId, packet.doctorCode, packet.discountCode);
        });
    }
    handleEndVisit(client, visitId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            this.visitsService.endVisit(visitId, false);
        });
    }
    handleAcceptVisit(client, visitId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            this.visitsService.acceptVisit(visitId, userId);
        });
    }
    handleTypingStatus(client, packet, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const visit = yield this.visitsRepo.crud().withId(packet.visitId)
                .where({ state: api_1.VisitStatus.STARTED })
                .project({ patient: 1, doctor: 1 })
                .findOne();
            if (!visit) {
                return;
            }
            if (userId !== String(visit.patient)) {
                this.socketService.sendEvent(String(visit.patient), 'typing_status', packet, packet.visitId);
            }
            if (userId !== String(visit.doctor)) {
                this.socketService.sendEvent(String(visit.doctor), 'typing_status', packet, packet.visitId);
            }
        });
    }
    handleMessage(client, packet, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const roomId = packet[0];
            const chat = packet[1];
            delete chat.sendStatus;
            chat.createdAt = (0, javascript_dev_kit_1.smartDate)().toISOString();
            this.visitsService.sendMessage(userId, roomId, chat, client.userProps.type);
        });
    }
    handleAcceptCall(client, packet, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            this.socketService.sendEvent(packet.initiator.id, api_1.EventType.EVENT_CALL_ACCEPTED, packet);
        });
    }
    handleDeclineCall(client, packet, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            this.socketService.sendEvent(packet.initiator.id, api_1.EventType.EVENT_CALL_DECLINED, packet);
        });
    }
    handleCallAnalytics(client, packet, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            packet.userId = userId;
            this.callsRepo.addCallMetric(packet);
            return true;
        });
    }
    handleExchangeSDP(client, packet, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { to } = packet;
            packet.from = userId;
            this.socketService.sendEvent(to, 'exchange-sdp', packet);
            return true;
        });
    }
    handleSetLanguage(client, packet, userId) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    handlePingClient(client, targetId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.socketService.isOnline(targetId);
        });
    }
};
__decorate([
    (0, websockets_1.SubscribeMessage)(api_1.EventType.REQUEST_VISIT),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __param(2, (0, userid_decorator_1.default)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object, Object]),
    __metadata("design:returntype", Promise)
], ClientsGateway.prototype, "handleRequestVisit", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(api_1.EventType.REQUEST_END_VISIT),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __param(2, (0, userid_decorator_1.default)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String, Object]),
    __metadata("design:returntype", Promise)
], ClientsGateway.prototype, "handleEndVisit", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(api_1.EventType.VISIT_REQUEST_ACCEPTED),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __param(2, (0, userid_decorator_1.default)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String, Object]),
    __metadata("design:returntype", Promise)
], ClientsGateway.prototype, "handleAcceptVisit", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing_status'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __param(2, (0, userid_decorator_1.default)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object, Object]),
    __metadata("design:returntype", Promise)
], ClientsGateway.prototype, "handleTypingStatus", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('message'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __param(2, (0, userid_decorator_1.default)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Array, Object]),
    __metadata("design:returntype", Promise)
], ClientsGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(api_1.EventType.EVENT_CALL_ACCEPTED),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __param(2, (0, userid_decorator_1.default)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, api_1.Conference, Object]),
    __metadata("design:returntype", Promise)
], ClientsGateway.prototype, "handleAcceptCall", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(api_1.EventType.EVENT_CALL_DECLINED),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __param(2, (0, userid_decorator_1.default)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object, Object]),
    __metadata("design:returntype", Promise)
], ClientsGateway.prototype, "handleDeclineCall", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('call-analytics'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __param(2, (0, userid_decorator_1.default)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, api_1.AbstractCallMetric, Object]),
    __metadata("design:returntype", Promise)
], ClientsGateway.prototype, "handleCallAnalytics", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('exchange-sdp'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __param(2, (0, userid_decorator_1.default)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object, Object]),
    __metadata("design:returntype", Promise)
], ClientsGateway.prototype, "handleExchangeSDP", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('set-language'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __param(2, (0, userid_decorator_1.default)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object, Object]),
    __metadata("design:returntype", Promise)
], ClientsGateway.prototype, "handleSetLanguage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ping_client'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __param(2, (0, userid_decorator_1.default)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String, Object]),
    __metadata("design:returntype", Promise)
], ClientsGateway.prototype, "handlePingClient", null);
ClientsGateway = __decorate([
    (0, common_1.UseFilters)(new WebsocketsExceptionFilter()),
    (0, common_1.Injectable)(),
    (0, websockets_1.WebSocketGateway)(7070, { path: '/live', transports: ['websocket'], namespace: '/', allowEIO3: true }),
    __metadata("design:paramtypes", [clients_socket_service_1.ClientsSocketService, calls_repo_1.default, visits_repo_1.default, auth_service_1.AuthService, users_repo_1.default, visits_service_1.VisitsService])
], ClientsGateway);
exports.default = ClientsGateway;

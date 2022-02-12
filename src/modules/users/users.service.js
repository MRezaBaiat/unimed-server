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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const api_1 = require("api");
const users_repo_1 = __importDefault(require("../../databases/users.repo"));
const files_service_1 = require("../files/files.service");
const clients_socket_service_1 = require("../socket/clients.socket.service");
const javascript_dev_kit_1 = require("javascript-dev-kit");
let UsersService = class UsersService {
    constructor(usersRepo, filesService, socketService) {
        this.usersRepo = usersRepo;
        this.filesService = filesService;
        this.socketService = socketService;
        this.deleteProfileImage = (userId) => __awaiter(this, void 0, void 0, function* () {
            const user = yield this.usersRepo.crud().withId(userId)
                .project({ imageUrl: 1 })
                .findOne();
            if (!user || !user.imageUrl) {
                return;
            }
            yield this.filesService.delete(user.imageUrl);
        });
    }
    createNew(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.usersRepo.crud().create(user);
        });
    }
    deleteUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.usersRepo.crud().withId(userId).findOne();
            if (!user) {
                console.log('no user with id ', userId);
                return;
            }
            if (user.imageUrl) {
                yield this.filesService.delete(user.imageUrl);
            }
            yield this.usersRepo.crud().withId(userId).deleteOne();
            yield this.socketService.deleteSession(userId);
        });
    }
    updateProfileImage(req, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.deleteProfileImage(userId);
            const res = yield this.filesService.upload(req, { fileType: api_1.ChatType.IMAGE });
            yield this.usersRepo.crud().withId(userId)
                .set({ imageUrl: res.url })
                .updateOne();
            return res.url;
        });
    }
    getNotificationSettings(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.usersRepo.crud().withId(userId).project({ 'settings.notifications': 1 }).findOne();
            if (!user.settings || !user.settings.notifications) {
                return {
                    newPatient: { notification: true, sms: false },
                    workTimeClose: { notification: true, sms: false },
                    workTimeEnded: { notification: true, sms: false },
                    workTimeStarted: { notification: true, sms: false }
                };
            }
            return user.settings.notifications;
        });
    }
    createJoiningDateReport() {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield this.usersRepo.crud().where({})
                .project({ creationDate: 1 })
                .findMany();
            const vals = {};
            users.forEach((u) => {
                const d = (0, javascript_dev_kit_1.smartDate)(u.createdAt);
                const val = d.jYear() + '/' + d.jMonth();
                if (!vals[val]) {
                    vals[val] = 0;
                }
                vals[val] += 1;
            });
            return vals;
        });
    }
};
UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_repo_1.default, files_service_1.FilesService, clients_socket_service_1.ClientsSocketService])
], UsersService);
exports.UsersService = UsersService;

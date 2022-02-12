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
const common_1 = require("@nestjs/common");
const files_service_1 = require("../files/files.service");
const api_1 = require("api/");
const jwt_auth_guard_1 = require("../../guards/jwt.auth.guard");
const userid_decorator_1 = __importDefault(require("../../decorators/userid.decorator"));
const visits_service_1 = require("../visits/visits.service");
const users_repo_1 = __importDefault(require("../../databases/users.repo"));
const javascript_dev_kit_1 = require("javascript-dev-kit/");
let ChatFilesController = class ChatFilesController {
    constructor(filesService, usersRepo, visitsService) {
        this.filesService = filesService;
        this.usersRepo = usersRepo;
        this.visitsService = visitsService;
    }
    handlePostFile(request, headers, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, roomid, type } = headers;
            const filename = decodeURIComponent(headers.filename);
            const mediaInfo = JSON.parse(headers.mediainfo);
            const { url, length } = yield this.filesService.upload(request, Object.assign(Object.assign({}, mediaInfo), { roomId: roomid, fileType: type }));
            const chat = {
                sendStatus: api_1.SendStatus.SENT,
                text: '',
                id,
                sender: userId,
                type,
                url,
                fileSize: length,
                mediaInfo,
                createdAt: (0, javascript_dev_kit_1.smartDate)().toISOString(),
                fileName: filename
            };
            const user = yield this.usersRepo.crud().withId(userId).project({ type: 1 }).findOne();
            this.visitsService.sendMessage(chat.sender, roomid, chat, user.type);
            return url;
        });
    }
};
__decorate([
    (0, common_1.Post)('/'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Headers)()),
    __param(2, (0, userid_decorator_1.default)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ChatFilesController.prototype, "handlePostFile", null);
ChatFilesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('chatfiles'),
    __metadata("design:paramtypes", [files_service_1.FilesService, users_repo_1.default, visits_service_1.VisitsService])
], ChatFilesController);
exports.default = ChatFilesController;

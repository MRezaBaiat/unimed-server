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
exports.FilesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../guards/jwt.auth.guard");
const files_service_1 = require("./files.service");
const visits_repo_1 = __importDefault(require("../../databases/visits.repo"));
const files_repo_1 = __importDefault(require("../../databases/files.repo"));
const mongoose_1 = require("@nestjs/mongoose/");
const mongoose_2 = require("mongoose");
const users_repo_1 = __importDefault(require("../../databases/users.repo"));
const Url = require('url');
let FilesController = class FilesController {
    constructor(filesService, usersRepo, visitsRepo, filesRepo, connection) {
        this.filesService = filesService;
        this.usersRepo = usersRepo;
        this.visitsRepo = visitsRepo;
        this.filesRepo = filesRepo;
        this.connection = connection;
    }
    handleGetChatFile(request, response, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.filesService.download(id, request, response);
        });
    }
    handleGetFile(request, response, id) {
        return this.filesService.download(id, request, response);
    }
};
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('/chat'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Response)()),
    __param(2, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "handleGetChatFile", null);
__decorate([
    (0, common_1.Get)('/'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Response)()),
    __param(2, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "handleGetFile", null);
FilesController = __decorate([
    (0, common_1.Controller)('files'),
    __param(4, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [files_service_1.FilesService, users_repo_1.default, visits_repo_1.default, files_repo_1.default, mongoose_2.Connection])
], FilesController);
exports.FilesController = FilesController;

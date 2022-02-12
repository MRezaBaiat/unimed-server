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
exports.ArchivesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../guards/jwt.auth.guard");
const archives_service_1 = require("./archives.service");
const userid_decorator_1 = __importDefault(require("../../decorators/userid.decorator"));
const archives_repo_1 = __importDefault(require("../../databases/archives.repo"));
const utils_1 = require("../../databases/utils");
const badrequest_error_1 = __importDefault(require("../../errors/badrequest-error"));
const files_service_1 = require("../files/files.service");
let ArchivesController = class ArchivesController {
    constructor(archivesService, archivesRepo, filesService) {
        this.archivesService = archivesService;
        this.archivesRepo = archivesRepo;
        this.filesService = filesService;
    }
    handleCreateArchive(body, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { title, note, patientId, chatId, visitId } = body;
            const file = chatId && visitId && {
                chatId,
                visitId
            };
            yield this.archivesService.create(userId, patientId, title, note, file);
            return true;
        });
    }
    handleUpdateArchive(body, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { _id, patientId, title, note } = body;
            return this.archivesRepo.crud().withId(_id)
                .where({ patient: (0, utils_1.ObjectId)(patientId), doctor: (0, utils_1.ObjectId)(userId) })
                .set({ title, note })
                .updateOne();
        });
    }
    handleDeleteArchive(body, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { _id, patientId } = body;
            const archive = yield this.archivesRepo.crud().withId(_id)
                .where({ patient: (0, utils_1.ObjectId)(patientId), doctor: (0, utils_1.ObjectId)(_id) })
                .project({ _id: 1, file: 1 })
                .findOne();
            if (!archive) {
                throw new badrequest_error_1.default('no such archive was found');
            }
            if (archive.file) {
                yield this.filesService.delete(archive.file.url);
            }
            return this.archivesRepo.crud().withId(_id).deleteOne();
        });
    }
};
__decorate([
    (0, common_1.Post)('/'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, userid_decorator_1.default)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ArchivesController.prototype, "handleCreateArchive", null);
__decorate([
    (0, common_1.Patch)('/'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, userid_decorator_1.default)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ArchivesController.prototype, "handleUpdateArchive", null);
__decorate([
    (0, common_1.Delete)('/'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, userid_decorator_1.default)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ArchivesController.prototype, "handleDeleteArchive", null);
ArchivesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('archives'),
    __metadata("design:paramtypes", [archives_service_1.ArchivesService, archives_repo_1.default, files_service_1.FilesService])
], ArchivesController);
exports.ArchivesController = ArchivesController;

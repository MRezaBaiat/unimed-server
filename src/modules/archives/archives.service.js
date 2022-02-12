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
exports.ArchivesService = void 0;
const common_1 = require("@nestjs/common");
const archives_repo_1 = __importDefault(require("../../databases/archives.repo"));
const users_repo_1 = __importDefault(require("../../databases/users.repo"));
const api_1 = require("api");
const badrequest_error_1 = __importDefault(require("../../errors/badrequest-error"));
const utils_1 = require("../../databases/utils");
const visits_repo_1 = __importDefault(require("../../databases/visits.repo"));
const files_service_1 = require("../files/files.service");
let ArchivesService = class ArchivesService {
    constructor(archivesRepo, usersRepo, visitsRepo, filesService) {
        this.archivesRepo = archivesRepo;
        this.usersRepo = usersRepo;
        this.visitsRepo = visitsRepo;
        this.filesService = filesService;
    }
    create(doctorId, patientId, title, note, file) {
        return __awaiter(this, void 0, void 0, function* () {
            const patient = yield this.usersRepo.crud().withId(patientId).project({ _id: 1, type: 1 }).findOne();
            if (!patient || patient.type !== api_1.UserType.PATIENT) {
                throw new badrequest_error_1.default();
            }
            const archive = {
                createdAt: Date.now(),
                doctor: (0, utils_1.ObjectId)(doctorId),
                patient: (0, utils_1.ObjectId)(patientId),
                title: title,
                note: note
            };
            if (file) {
                const visit = yield this.visitsRepo.crud().withId(file.visitId)
                    .where({ doctor: (0, utils_1.ObjectId)(doctorId), patient: (0, utils_1.ObjectId)(patientId) })
                    .project({ conversations: 1 })
                    .findOne();
                if (!visit) {
                    throw new badrequest_error_1.default('visit was not found');
                }
                const chat = visit.conversations.find(c => c.chat.id === file.chatId);
                if (!chat) {
                    throw new badrequest_error_1.default('chat was not found');
                }
                if (!chat.chat.url) {
                    throw new badrequest_error_1.default('chat was not a file');
                }
                const fileName = api_1.Helper.generateUUID();
            }
            return this.archivesRepo.crud().create(archive);
        });
    }
    ;
};
ArchivesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [archives_repo_1.default, users_repo_1.default, visits_repo_1.default, files_service_1.FilesService])
], ArchivesService);
exports.ArchivesService = ArchivesService;

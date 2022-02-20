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
exports.HealthCentersService = void 0;
const common_1 = require("@nestjs/common");
const health_centers_repo_1 = __importDefault(require("../../databases/health.centers.repo"));
const api_1 = require("api");
const users_repo_1 = __importDefault(require("../../databases/users.repo"));
const utils_1 = require("../../databases/utils");
const files_service_1 = require("../files/files.service");
let HealthCentersService = class HealthCentersService {
    constructor(filesService, healthCentersRepo, usersRepo) {
        this.filesService = filesService;
        this.healthCentersRepo = healthCentersRepo;
        this.usersRepo = usersRepo;
    }
    getDoctorsInHealthCenter(centerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield this.usersRepo.crud()
                .orWhere({ 'details.clinics': (0, utils_1.arrayIncludes)([(0, utils_1.ObjectId)(centerId)]) })
                .orWhere({ 'details.hospitals': (0, utils_1.arrayIncludes)([(0, utils_1.ObjectId)(centerId)]) })
                .project({ _id: 1, name: 1, price: 1, imageUrl: 1, code: 1, 'details.responseDays': 1 })
                .findMany();
            const center = yield this.healthCentersRepo.crud().withId(centerId).project({ priorities: 1 }).findOne();
            const prioritized = [];
            center.priorities.forEach((userId) => {
                const user = users.find(s => String(s._id) === userId);
                if (user) {
                    prioritized.push(user);
                }
            });
            users.forEach((user) => {
                if (prioritized.indexOf(user) < 0) {
                    prioritized.push(user);
                }
            });
            return prioritized;
        });
    }
    updateLogoImage(id, req) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.deleteLogoImage(id);
            const res = yield this.filesService.upload(req, { fileType: api_1.ChatType.IMAGE });
            yield this.healthCentersRepo.crud().withId(id).set({ logoUrl: res.url }).updateOne();
            return res.url;
        });
    }
    ;
    deleteWallpaperImage(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const center = yield this.healthCentersRepo.crud().withId(id).project({ wallpaperUrl: 1 }).findOne();
            if (!center || !center.wallpaperUrl) {
                return;
            }
            yield this.filesService.delete(center.wallpaperUrl);
        });
    }
    ;
    updateWallpaperImage(id, req) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.deleteWallpaperImage(id);
            const res = yield this.filesService.upload(req, { fileType: api_1.ChatType.IMAGE });
            yield this.healthCentersRepo.crud().withId(id).set({ wallpaperUrl: res.url }).updateOne();
            return res.url;
        });
    }
    ;
    deleteLogoImage(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const center = yield this.healthCentersRepo.crud().withId(id).project({ logoUrl: 1 }).findOne();
            if (!center || !center.logoUrl) {
                return;
            }
            yield this.filesService.delete(center.logoUrl);
        });
    }
    ;
    deleteHealthCenter(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const center = yield this.healthCentersRepo.crud().withId(id)
                .where({ logoUrl: 1, wallpaperUrl: 1 })
                .findOne();
            if (!center) {
                return;
            }
            const keys = ['0', '1', '2', '3', '4', '5', '6'];
            const conditions = [];
            conditions.push({ 'details.responseDays.0.healthCenter': id });
            conditions.push({ 'details.responseDays.1.healthCenter': id });
            conditions.push({ 'details.responseDays.2.healthCenter': id });
            conditions.push({ 'details.responseDays.3.healthCenter': id });
            conditions.push({ 'details.responseDays.4.healthCenter': id });
            conditions.push({ 'details.responseDays.5.healthCenter': id });
            conditions.push({ 'details.responseDays.6.healthCenter': id });
            const users = yield this.usersRepo.crud().where({ $or: [...conditions, { 'details.clinics': (0, utils_1.arrayIncludes)([(0, utils_1.ObjectId)(id)]) }, { 'details.hospitals': (0, utils_1.arrayIncludes)([(0, utils_1.ObjectId)(id)]) }] })
                .project({ _id: 1, details: 1 })
                .findMany();
            users.forEach((user) => {
                let arr = user.details.clinics;
                for (let i = arr.length - 1; i >= 0; i--) {
                    const s = arr[i];
                    if (String(s._id) === String(id)) {
                        arr.splice(arr.indexOf(s), 1);
                    }
                }
                arr = user.details.hospitals;
                for (let i = arr.length - 1; i >= 0; i--) {
                    const s = arr[i];
                    if (String(s._id) === String(id)) {
                        arr.splice(arr.indexOf(s), 1);
                    }
                }
                keys.forEach((day) => {
                    arr = user.details.responseDays[day];
                    for (let i = arr.length - 1; i >= 0; i--) {
                        const s = arr[i];
                        if (s.healthCenter && String(s.healthCenter._id) === String(id)) {
                            arr.splice(arr.indexOf(s), 1);
                        }
                    }
                });
                this.usersRepo.crud().withId(user._id).set(user).patch();
            });
            if (center.logoUrl) {
                yield this.filesService.delete(center.logoUrl);
            }
            if (center.wallpaperUrl) {
                yield this.filesService.delete(center.wallpaperUrl);
            }
            return this.healthCentersRepo.crud().withId(id).deleteOne();
        });
    }
};
HealthCentersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [files_service_1.FilesService, health_centers_repo_1.default, users_repo_1.default])
], HealthCentersService);
exports.HealthCentersService = HealthCentersService;

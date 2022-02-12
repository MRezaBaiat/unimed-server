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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthCentersController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../guards/jwt.auth.guard");
const health_centers_repo_1 = __importDefault(require("../../databases/health.centers.repo"));
const health_centers_service_1 = require("./health.centers.service");
let HealthCentersController = class HealthCentersController {
    constructor(healthCentersRepo, healthCentersService) {
        this.healthCentersRepo = healthCentersRepo;
        this.healthCentersService = healthCentersService;
    }
    handleGetAll() {
        return this.healthCentersRepo.crud()
            .sort({ priority: 1 })
            .findMany();
    }
    handleGetDoctorsIn(id) {
        return this.healthCentersService.getDoctorsInHealthCenter(id);
    }
};
__decorate([
    (0, common_1.Get)('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthCentersController.prototype, "handleGetAll", null);
__decorate([
    (0, common_1.Get)('/in'),
    __param(0, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HealthCentersController.prototype, "handleGetDoctorsIn", null);
HealthCentersController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('healthcenters'),
    __metadata("design:paramtypes", [health_centers_repo_1.default, health_centers_service_1.HealthCentersService])
], HealthCentersController);
exports.HealthCentersController = HealthCentersController;

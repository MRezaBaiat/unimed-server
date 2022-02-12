"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthCentersModule = void 0;
const common_1 = require("@nestjs/common");
const health_centers_controller_1 = require("./health.centers.controller");
const health_centers_service_1 = require("./health.centers.service");
const admin_health_centers_controller_1 = __importDefault(require("./admin.health.centers.controller"));
const files_module_1 = require("../files/files.module");
let HealthCentersModule = class HealthCentersModule {
};
HealthCentersModule = __decorate([
    (0, common_1.Module)({
        imports: [files_module_1.FilesModule],
        controllers: [health_centers_controller_1.HealthCentersController, admin_health_centers_controller_1.default],
        providers: [health_centers_service_1.HealthCentersService]
    })
], HealthCentersModule);
exports.HealthCentersModule = HealthCentersModule;

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
exports.CrashesModule = void 0;
const common_1 = require("@nestjs/common");
const crashes_controller_1 = require("./crashes.controller");
const crashes_service_1 = require("./crashes.service");
const crashes_admin_controller_1 = __importDefault(require("./crashes.admin.controller"));
let CrashesModule = class CrashesModule {
};
CrashesModule = __decorate([
    (0, common_1.Module)({
        controllers: [crashes_controller_1.CrashesController, crashes_admin_controller_1.default],
        providers: [crashes_service_1.CrashesService]
    })
], CrashesModule);
exports.CrashesModule = CrashesModule;

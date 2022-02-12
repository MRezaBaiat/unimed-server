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
exports.DiscountsModule = void 0;
const common_1 = require("@nestjs/common");
const discounts_service_1 = require("./discounts.service");
const discounts_controller_1 = require("./discounts.controller");
const discounts_admin_controller_1 = __importDefault(require("./discounts.admin.controller"));
let DiscountsModule = class DiscountsModule {
};
DiscountsModule = __decorate([
    (0, common_1.Module)({
        providers: [discounts_service_1.DiscountsService],
        controllers: [discounts_controller_1.DiscountsController, discounts_admin_controller_1.default],
        exports: [discounts_service_1.DiscountsService]
    })
], DiscountsModule);
exports.DiscountsModule = DiscountsModule;

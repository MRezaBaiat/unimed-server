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
exports.VisitsModule = void 0;
const common_1 = require("@nestjs/common");
const visits_controller_1 = require("./visits.controller");
const visits_service_1 = require("./visits.service");
const visits_admin_controller_1 = __importDefault(require("./visits.admin.controller"));
const discounts_module_1 = require("../discounts/discounts.module");
const transactions_service_1 = require("../transactions/transactions.service");
let VisitsModule = class VisitsModule {
};
VisitsModule = __decorate([
    (0, common_1.Module)({
        imports: [discounts_module_1.DiscountsModule],
        controllers: [visits_controller_1.VisitsController, visits_admin_controller_1.default],
        providers: [visits_service_1.VisitsService, transactions_service_1.TransactionsService],
        exports: [visits_service_1.VisitsService]
    })
], VisitsModule);
exports.VisitsModule = VisitsModule;

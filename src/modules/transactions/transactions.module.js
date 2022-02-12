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
exports.TransactionsModule = void 0;
const common_1 = require("@nestjs/common");
const transactions_service_1 = require("./transactions.service");
const transactions_admin_controller_1 = __importDefault(require("./transactions.admin.controller"));
const gateway_service_1 = require("../gateway/gateway.service");
const transactions_controller_1 = __importDefault(require("./transactions.controller"));
let TransactionsModule = class TransactionsModule {
};
TransactionsModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [transactions_controller_1.default, transactions_admin_controller_1.default],
        providers: [transactions_service_1.TransactionsService, gateway_service_1.GatewayService],
        exports: [transactions_service_1.TransactionsService]
    })
], TransactionsModule);
exports.TransactionsModule = TransactionsModule;

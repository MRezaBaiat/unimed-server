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
exports.ChatFilesModule = void 0;
const common_1 = require("@nestjs/common");
const chat_files_controller_1 = __importDefault(require("./chat.files.controller"));
const chat_files_service_1 = __importDefault(require("./chat.files.service"));
const files_module_1 = require("../files/files.module");
const visits_service_1 = require("../visits/visits.service");
const discounts_service_1 = require("../discounts/discounts.service");
const transactions_service_1 = require("../transactions/transactions.service");
let ChatFilesModule = class ChatFilesModule {
};
ChatFilesModule = __decorate([
    (0, common_1.Module)({
        imports: [files_module_1.FilesModule],
        controllers: [chat_files_controller_1.default],
        providers: [chat_files_service_1.default, visits_service_1.VisitsService, discounts_service_1.DiscountsService, transactions_service_1.TransactionsService],
        exports: []
    })
], ChatFilesModule);
exports.ChatFilesModule = ChatFilesModule;

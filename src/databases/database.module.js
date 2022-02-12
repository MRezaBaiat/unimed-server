"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const users_repo_1 = __importStar(require("./users.repo"));
const server_configs_repo_1 = __importStar(require("./server.configs.repo"));
const visits_repo_1 = __importStar(require("./visits.repo"));
const transactions_repo_1 = __importStar(require("./transactions.repo"));
const admins_repo_1 = __importStar(require("./admins.repo"));
const health_centers_repo_1 = __importStar(require("./health.centers.repo"));
const discounts_repo_1 = __importStar(require("./discounts.repo"));
const crashes_repo_1 = __importStar(require("./crashes.repo"));
const archives_repo_1 = __importStar(require("./archives.repo"));
const specializations_repo_1 = __importStar(require("./specializations.repo"));
const notifications_repo_1 = __importStar(require("./notifications.repo"));
const calls_repo_1 = __importStar(require("./calls.repo"));
const admin_logs_repo_1 = __importStar(require("./admin.logs.repo"));
const files_repo_1 = __importStar(require("./files.repo"));
const userModel = mongoose_1.MongooseModule.forFeature([
    { name: 'users', schema: users_repo_1.UserSchema }
]);
const serverConfigsModel = mongoose_1.MongooseModule.forFeature([
    { name: 'server_config', schema: server_configs_repo_1.ServerConfigsSchema }
]);
const visitModel = mongoose_1.MongooseModule.forFeature([
    { name: 'visits', schema: visits_repo_1.VisitSchema }
]);
const transactionModel = mongoose_1.MongooseModule.forFeature([
    { name: 'transactions', schema: transactions_repo_1.TransactionSchema }
]);
const adminsModel = mongoose_1.MongooseModule.forFeature([
    { name: 'admins', schema: admins_repo_1.AdminsSchema }
]);
const healthCentersModel = mongoose_1.MongooseModule.forFeature([
    { name: 'healthcenters', schema: health_centers_repo_1.HealthCentersSchema }
]);
const discountsModel = mongoose_1.MongooseModule.forFeature([
    { name: 'discount_coupons', schema: discounts_repo_1.DiscountSchema }
]);
const crashesModel = mongoose_1.MongooseModule.forFeature([
    { name: 'crashes', schema: crashes_repo_1.CrashSchema }
]);
const archivesModel = mongoose_1.MongooseModule.forFeature([
    { name: 'archives', schema: archives_repo_1.ArchiveSchema }
]);
const specializationModel = mongoose_1.MongooseModule.forFeature([
    { name: 'specializations', schema: specializations_repo_1.SpecializationSchema }
]);
const notificationModel = mongoose_1.MongooseModule.forFeature([
    { name: 'notifications', schema: notifications_repo_1.NotificationSchema }
]);
const callModel = mongoose_1.MongooseModule.forFeature([
    { name: 'calls', schema: calls_repo_1.CallSchema }
]);
const adminLogModel = mongoose_1.MongooseModule.forFeature([
    { name: 'admin-logs', schema: admin_logs_repo_1.AdminLogSchema }
]);
const fileInfoModel = mongoose_1.MongooseModule.forFeature([
    { name: 'fs.files', schema: files_repo_1.FileInfoSchema }
]);
let DatabaseModule = class DatabaseModule {
};
DatabaseModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [fileInfoModel, adminLogModel, callModel, notificationModel, specializationModel, archivesModel, crashesModel, discountsModel, healthCentersModel, userModel, serverConfigsModel, visitModel, transactionModel, adminsModel],
        controllers: [],
        providers: [files_repo_1.default, admin_logs_repo_1.default, calls_repo_1.default, notifications_repo_1.default, specializations_repo_1.default, archives_repo_1.default, crashes_repo_1.default, discounts_repo_1.default, health_centers_repo_1.default, admins_repo_1.default, transactions_repo_1.default, visits_repo_1.default, users_repo_1.default, server_configs_repo_1.default],
        exports: [files_repo_1.default, admin_logs_repo_1.default, calls_repo_1.default, notifications_repo_1.default, specializations_repo_1.default, archives_repo_1.default, crashes_repo_1.default, discounts_repo_1.default, health_centers_repo_1.default, admins_repo_1.default, transactions_repo_1.default, visits_repo_1.default, users_repo_1.default, server_configs_repo_1.default]
    })
], DatabaseModule);
exports.DatabaseModule = DatabaseModule;

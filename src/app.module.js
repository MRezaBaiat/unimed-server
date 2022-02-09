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
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const mongoose_1 = require("@nestjs/mongoose");
const users_module_1 = require("./modules/users/users.module");
const auth_module_1 = require("./modules/auth/auth.module");
const redis_module_1 = require("./modules/redis/redis.module");
const configs_module_1 = __importDefault(require("./modules/configs/configs.module"));
const visits_module_1 = require("./modules/visits/visits.module");
const lock_module_1 = require("./modules/lock/lock.module");
const socket_module_1 = require("./modules/socket/socket.module");
const files_module_1 = require("./modules/files/files.module");
const webapi_module_1 = require("./modules/webapi/webapi.module");
const reservations_module_1 = require("./modules/reservations/reservations.module");
const medical_services_module_1 = require("./modules/medicalservices/medical.services.module");
const health_centers_module_1 = require("./modules/healthcenters/health.centers.module");
const gateway_module_1 = require("./modules/gateway/gateway.module");
const discounts_module_1 = require("./modules/discounts/discounts.module");
const crashes_module_1 = require("./modules/crashes/crashes.module");
const archives_module_1 = require("./modules/archives/archives.module");
const surveys_module_1 = require("./modules/surveys/surveys.module");
const specializations_module_1 = require("./modules/specializations/specializations.module");
const server_configs_module_1 = require("./modules/server-configs/server-configs.module");
const calls_module_1 = require("./modules/calls/calls.module");
const admins_module_1 = require("./modules/admins/admins.module");
const admin_logger_module_1 = require("./modules/adminlogger/admin.logger.module");
const database_module_1 = require("./databases/database.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const transactions_module_1 = require("./modules/transactions/transactions.module");
const chat_files_module_1 = require("./modules/chatfiles/chat.files.module");
const timer_module_1 = require("./modules/timer/timer.module");
const schedule_1 = require("@nestjs/schedule");
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            configs_module_1.default,
            mongoose_1.MongooseModule.forRoot(process.env.MONGODB_URL),
            redis_module_1.RedisModule,
            auth_module_1.AuthModule,
            lock_module_1.LockModule,
            socket_module_1.SocketModule,
            database_module_1.DatabaseModule,
            notifications_module_1.NotificationsModule,
            reservations_module_1.ReservationsModule,
            files_module_1.FilesModule,
            users_module_1.UsersModule,
            visits_module_1.VisitsModule,
            health_centers_module_1.HealthCentersModule,
            surveys_module_1.SurveysModule,
            webapi_module_1.WebapiModule,
            medical_services_module_1.MedicalServicesModule,
            transactions_module_1.TransactionsModule,
            gateway_module_1.GatewayModule,
            discounts_module_1.DiscountsModule,
            crashes_module_1.CrashesModule,
            archives_module_1.ArchivesModule,
            specializations_module_1.SpecializationsModule,
            server_configs_module_1.ServerConfigsModule,
            calls_module_1.CallsModule,
            admins_module_1.AdminsModule,
            admin_logger_module_1.AdminLoggerModule,
            chat_files_module_1.ChatFilesModule,
            timer_module_1.TimerModule
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
        exports: [auth_module_1.AuthModule]
    })
], AppModule);
exports.AppModule = AppModule;

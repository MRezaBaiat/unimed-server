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
exports.NotificationsModule = void 0;
const common_1 = require("@nestjs/common");
const sms_service_1 = __importDefault(require("./sms.service"));
const push_notification_service_1 = __importDefault(require("./push.notification.service"));
const events_service_1 = __importDefault(require("./events.service"));
const notifications_admin_controller_1 = __importDefault(require("./notifications.admin.controller"));
const users_module_1 = require("../users/users.module");
let NotificationsModule = class NotificationsModule {
};
NotificationsModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [users_module_1.UsersModule],
        controllers: [notifications_admin_controller_1.default],
        providers: [sms_service_1.default, push_notification_service_1.default, events_service_1.default],
        exports: [sms_service_1.default, push_notification_service_1.default, events_service_1.default]
    })
], NotificationsModule);
exports.NotificationsModule = NotificationsModule;

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
const common_1 = require("@nestjs/common/");
const admin_jwt_auth_guard_1 = require("../../guards/admin.jwt.auth.guard");
const notification_create_dto_1 = __importDefault(require("./dto/notification.create.dto"));
const push_notification_service_1 = __importDefault(require("./push.notification.service"));
const userid_decorator_1 = __importDefault(require("../../decorators/userid.decorator"));
const notifications_repo_1 = __importDefault(require("../../databases/notifications.repo"));
const whitelist_decorator_1 = __importDefault(require("../../decorators/whitelist.decorator"));
let NotificationsAdminController = class NotificationsAdminController {
    constructor(pushNotificationsService, notificationsRepo) {
        this.pushNotificationsService = pushNotificationsService;
        this.notificationsRepo = notificationsRepo;
    }
    handleCreateNotification(body, userId) {
        return this.pushNotificationsService.sendToAll(body.title, body.body, body.link, userId);
    }
    handleGet(id) {
        return this.notificationsRepo.crud().withId(id).populate(['sender']).findOne();
    }
    handleQuery(search, skip, limit, whiteList) {
        return this.pushNotificationsService.query(Number(skip), Number(limit), search, whiteList);
    }
};
__decorate([
    (0, common_1.Post)('/'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, userid_decorator_1.default)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [notification_create_dto_1.default, Object]),
    __metadata("design:returntype", void 0)
], NotificationsAdminController.prototype, "handleCreateNotification", null);
__decorate([
    (0, common_1.Get)('/'),
    __param(0, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsAdminController.prototype, "handleGet", null);
__decorate([
    (0, common_1.Get)('/query'),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('skip')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, whitelist_decorator_1.default)('notifications')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", void 0)
], NotificationsAdminController.prototype, "handleQuery", null);
NotificationsAdminController = __decorate([
    (0, common_1.UseGuards)(admin_jwt_auth_guard_1.AdminJwtAuthGuard),
    (0, common_1.Controller)('admin/notifications'),
    __metadata("design:paramtypes", [push_notification_service_1.default, notifications_repo_1.default])
], NotificationsAdminController);
exports.default = NotificationsAdminController;

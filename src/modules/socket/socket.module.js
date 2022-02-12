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
exports.SocketModule = void 0;
const common_1 = require("@nestjs/common");
const clients_socket_service_1 = require("./clients.socket.service");
const socket_controller_1 = require("./socket.controller");
const auth_module_1 = require("../auth/auth.module");
const visits_module_1 = require("../visits/visits.module");
const clients_gateway_1 = __importDefault(require("./clients.gateway"));
let SocketModule = class SocketModule {
};
SocketModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule, visits_module_1.VisitsModule],
        controllers: [socket_controller_1.SocketController],
        providers: [clients_socket_service_1.ClientsSocketService, clients_gateway_1.default],
        exports: [clients_socket_service_1.ClientsSocketService]
    })
], SocketModule);
exports.SocketModule = SocketModule;

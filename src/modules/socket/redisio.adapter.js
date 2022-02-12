"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
const socket_io_redis_1 = __importDefault(require("socket.io-redis"));
class RedisIoAdapter extends platform_socket_io_1.IoAdapter {
    createIOServer(port, options) {
        const server = super.createIOServer(port, options);
        const redisAdapter = (0, socket_io_redis_1.default)({ host: process.env.REDIS_HOST, port: process.env.REDIS_PORT });
        server.adapter(redisAdapter);
        return server;
    }
}
exports.default = RedisIoAdapter;

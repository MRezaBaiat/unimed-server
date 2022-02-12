import { IoAdapter } from '@nestjs/platform-socket.io';
import redisIoAdapter from 'socket.io-redis';

export default class RedisIoAdapter extends IoAdapter {
  createIOServer (port: number, options?: any): any {
    const server = super.createIOServer(port, options);
    // @ts-ignore
    const redisAdapter = redisIoAdapter({ host: process.env.REDIS_HOST, port: process.env.REDIS_PORT });

    server.adapter(redisAdapter);
    return server;
  }
}

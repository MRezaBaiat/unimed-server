import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe, VersioningType } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import RedisIoAdapter from './modules/socket/redisio.adapter';
import multipart from 'fastify-multipart';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { LoggerMiddleware } from './middlewares/logger.middleware';
const helmet = require('fastify-helmet');

async function bootstrap () {
  const adapter = new FastifyAdapter({ logger: false });
  adapter.register(require('fastify-cookie'), {
    parseOptions: {} // options for parsing cookies
  });
  adapter.register(multipart, {
    addToBody: false,
    attachFieldsToBody: false,
    throwFileSizeLimit: true,
    limits: {
      fieldNameSize: 100,
      fields: 1,
      files: 1,
      fieldSize: 1000000,
      fileSize: 10000000,
      headerPairs: 2000
    }
  });
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter
  );
  await app.startAllMicroservices();
  app.useGlobalPipes(new ValidationPipe());
  app.use(LoggerMiddleware);
  app.enableCors({ origin: true, credentials: true });
  app.use(cookieParser());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useWebSocketAdapter(new RedisIoAdapter(app));
  await app.register(helmet);
  await app.listen(3000, '0.0.0.0');
}
bootstrap();

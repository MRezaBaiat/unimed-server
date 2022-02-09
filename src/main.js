"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const redisio_adapter_1 = __importDefault(require("./modules/socket/redisio.adapter"));
const fastify_multipart_1 = __importDefault(require("fastify-multipart"));
const platform_fastify_1 = require("@nestjs/platform-fastify");
const logger_middleware_1 = require("./middlewares/logger.middleware");
const helmet = require('fastify-helmet');
function bootstrap() {
    return __awaiter(this, void 0, void 0, function* () {
        const adapter = new platform_fastify_1.FastifyAdapter({ logger: false });
        adapter.register(require('fastify-cookie'), {
            parseOptions: {}
        });
        adapter.register(fastify_multipart_1.default, {
            addToBody: false,
            attachFieldsToBody: false,
            throwFileSizeLimit: true,
            limits: {
                fieldNameSize: 100,
                fields: 1,
                files: 1,
                fieldSize: 100000,
                fileSize: 1000000,
                headerPairs: 2000
            }
        });
        const app = yield core_1.NestFactory.create(app_module_1.AppModule, adapter);
        yield app.startAllMicroservices();
        app.useGlobalPipes(new common_1.ValidationPipe());
        app.use(logger_middleware_1.LoggerMiddleware);
        app.enableCors({ origin: true, credentials: true });
        app.use((0, cookie_parser_1.default)());
        app.useGlobalInterceptors(new common_1.ClassSerializerInterceptor(app.get(core_1.Reflector)));
        app.useWebSocketAdapter(new redisio_adapter_1.default(app));
        yield app.register(helmet);
        yield app.listen(3000, '0.0.0.0');
    });
}
bootstrap();

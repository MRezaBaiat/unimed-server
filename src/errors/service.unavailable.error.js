"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceUnavailableError = void 0;
const common_1 = require("@nestjs/common");
class ServiceUnavailableError extends common_1.HttpException {
    constructor(message) {
        super(message, common_1.HttpStatus.SERVICE_UNAVAILABLE);
    }
}
exports.ServiceUnavailableError = ServiceUnavailableError;

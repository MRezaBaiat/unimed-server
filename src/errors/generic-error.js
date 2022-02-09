"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
class GenericError {
    constructor(message, statusCode = common_1.HttpStatus.INTERNAL_SERVER_ERROR, id) {
        this.message = message;
        this.statusCode = statusCode;
        this.id = id;
    }
}
exports.default = GenericError;

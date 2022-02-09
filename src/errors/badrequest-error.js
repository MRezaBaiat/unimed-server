"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const generic_error_1 = __importDefault(require("./generic-error"));
const common_1 = require("@nestjs/common");
class BadRequestError extends generic_error_1.default {
    constructor(message, id) {
        super(message, common_1.HttpStatus.BAD_REQUEST, id);
    }
}
exports.default = BadRequestError;

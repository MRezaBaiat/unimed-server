"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerMiddleware = void 0;
const morgan_1 = __importDefault(require("morgan"));
const logger = (0, morgan_1.default)('dev');
function LoggerMiddleware(req, res, next) {
    logger(req, res, next);
}
exports.LoggerMiddleware = LoggerMiddleware;

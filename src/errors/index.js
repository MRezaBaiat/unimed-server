"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const access_denied_error_1 = __importDefault(require("./access-denied-error"));
const authentication_error_1 = __importDefault(require("./authentication-error"));
const validation_error_1 = __importDefault(require("./validation-error"));
const generic_error_1 = __importDefault(require("./generic-error"));
const badrequest_error_1 = __importDefault(require("./badrequest-error"));
const internal_server_error_1 = __importDefault(require("./internal-server-error"));
exports.default = {
    AccessDeniedError: access_denied_error_1.default,
    AuthenticationError: authentication_error_1.default,
    ValidationError: validation_error_1.default,
    GenericError: generic_error_1.default,
    BadRequestError: badrequest_error_1.default,
    InternalServerError: internal_server_error_1.default,
};

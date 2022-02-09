"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdAccessGuard = void 0;
const common_1 = require("@nestjs/common");
const utils_1 = require("../utils");
const access_denied_error_1 = __importDefault(require("../errors/access-denied-error"));
let Guard = class Guard {
    constructor(type, extractor) {
        this.type = type;
        this.extractor = extractor;
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const privileges = request.privileges;
        const options = privileges[this.type];
        const method = request.method.toLowerCase();
        const details = options[method];
        details.test = eval(details.test || privileges.defaultTestFunction || utils_1.defaultPrivilegeTestFunctionString);
        if (!details.test(options, request)) {
            throw new access_denied_error_1.default('You do not have enough privileges to do so!');
        }
        if (details.whiteList.length === 0) {
            return true;
        }
        const id = String(this.extractor(request));
        return details.whiteList.find(s => String(s) === id);
    }
};
Guard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [String, Function])
], Guard);
const IdAccessGuard = (type, extractor) => {
    return new Guard(type, extractor);
};
exports.IdAccessGuard = IdAccessGuard;

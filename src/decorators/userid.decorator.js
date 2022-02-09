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
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const UserId = (0, common_1.createParamDecorator)((data, ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (ctx.getType() === 'ws') {
        const client = ctx.switchToWs().getClient();
        return client.userProps.userid;
    }
    else {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    }
}));
exports.default = UserId;

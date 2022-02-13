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
exports.AuthStrategy = void 0;
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
class AuthStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor() {
        super({
            algorithms: ['HS256'],
            issuer: process.env.TOKEN_ISSUER,
            secretOrKey: process.env.JWT_STRATEGY_SECRET_KEY,
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: true
        });
    }
    validate(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return payload.userid;
        });
    }
}
exports.AuthStrategy = AuthStrategy;

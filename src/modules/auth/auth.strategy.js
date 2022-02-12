"use strict";
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
    async validate(payload) {
        return payload.userid;
    }
}
exports.AuthStrategy = AuthStrategy;

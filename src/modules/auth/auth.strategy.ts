import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export class AuthStrategy extends PassportStrategy(Strategy) {
  constructor () {
    super({
      algorithms: ['HS256'],
      issuer: process.env.TOKEN_ISSUER,
      secretOrKey: process.env.JWT_STRATEGY_SECRET_KEY,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true
    });
  }

  async validate (payload: any) {
    return payload.userid;
  }
}

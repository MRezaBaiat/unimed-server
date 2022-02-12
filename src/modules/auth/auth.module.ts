import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthStrategy } from './auth.strategy';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import SmsService from '../notifications/sms.service';
import ConfigsModule from '../configs/configs.module';

@Module({
  imports: [
    ConfigsModule,
    JwtModule.register({
      secret: process.env.JWT_STRATEGY_SECRET_KEY
    }),
    PassportModule
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthStrategy, SmsService],
  exports: [AuthService]
})
export class AuthModule {}

import {
  IsNotEmpty,
  IsString,
  IsOptional
} from 'class-validator';

export default class OtpSignInDto {
  @IsString()
  @IsOptional()
  fcmtoken: string;

  @IsNotEmpty()
  @IsString()
  otp: string;

  @IsString()
  @IsOptional()
  version: string;

  @IsString()
  @IsOptional()
  os: string;
}

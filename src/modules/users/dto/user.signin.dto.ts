import { IsNotEmpty, IsString, IsMobilePhone } from 'class-validator';

export default class UserSignInDto {
  @IsNotEmpty()
  @IsString()
    mobile: string;
}

import { IsNotEmpty, IsString } from 'class-validator';

export default class AdminSignInDto {
    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}

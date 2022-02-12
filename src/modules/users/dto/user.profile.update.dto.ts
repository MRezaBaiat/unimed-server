import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export default class UserProfileUpdateDto {
    @IsString()
    name: string;

    @IsString()
    gender: 'male' | 'female'
}

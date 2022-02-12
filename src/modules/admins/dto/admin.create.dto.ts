import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { AdminType, Privileges } from 'api';

export default class AdminCreateDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    type: AdminType;

    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsObject()
    @IsNotEmpty()
    privileges: Privileges
}

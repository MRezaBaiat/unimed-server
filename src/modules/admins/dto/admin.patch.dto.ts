import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { Privileges } from 'api';

export default class AdminPatchDto {
    @IsString()
    @IsNotEmpty()
    _id: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    username: string;

    @IsObject()
    @IsNotEmpty()
    privileges: Privileges;
}

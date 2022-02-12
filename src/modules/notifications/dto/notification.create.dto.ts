import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export default class NotificationCreateDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    body:string;

    @IsString()
    @IsOptional()
    link?: string;
}

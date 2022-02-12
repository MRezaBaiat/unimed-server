import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { HealthCenterType } from 'api/';

export default class HealthCenterPatchDto {
    @IsString()
    @IsNotEmpty()
    _id: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    wallpaperUrl?: string;

    @IsString()
    @IsOptional()
    logoUrl?: string;

    @IsString()
    @IsOptional()
    type: HealthCenterType;

    @IsNumber()
    @IsNotEmpty()
    percentage: number;

    @IsArray()
    @IsNotEmpty()
    priorities: string[];

    @IsString()
    @IsNotEmpty()
    shaba: string;

    @IsNumber()
    @IsNotEmpty()
    priority: number;
}

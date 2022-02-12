import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { HealthCenterType } from 'api/';

export default class HealthCenterCreateDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsString()
    @IsOptional()
    logoUrl?: string;

    @IsString()
    @IsNotEmpty()
    type: HealthCenterType;

    @IsNumber()
    @IsNotEmpty()
    percentage: number;

    @IsArray()
    @IsOptional()
    priorities: string[]

    @IsString()
    @IsOptional()
    shaba?: string;

    @IsNumber()
    @IsOptional()
    priority?: number;
}

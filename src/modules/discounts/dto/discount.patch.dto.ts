import { IsNotEmpty, IsNumber, IsString } from 'class-validator/';

export default class DiscountPatchDto {
    @IsString()
    @IsNotEmpty()
    _id: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    code: string;

    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @IsNumber()
    @IsNotEmpty()
    end_date: number;

    @IsNumber()
    @IsNotEmpty()
    per_user_limit: number;

    @IsNumber()
    @IsNotEmpty()
    total_usage_limit: number;
}

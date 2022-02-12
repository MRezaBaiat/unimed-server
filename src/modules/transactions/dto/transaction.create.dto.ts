import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export default class TransactionCreateDto {
    @IsNotEmpty()
    @IsNumber()
    amount:number;

    @IsString()
    @IsNotEmpty()
    type: string

    @IsString()
    @IsOptional()
    tracking_code?: string;

    @IsString()
    @IsOptional()
    hint: string;
}

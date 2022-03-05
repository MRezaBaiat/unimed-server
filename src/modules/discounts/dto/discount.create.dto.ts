import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export default class DiscountCreateDto {
    @IsString()
    @IsNotEmpty()
      title: string;

    @IsString()
    @IsNotEmpty()
      code: string;

    @IsNumber()
    @IsNotEmpty()
      amount: number;

    @IsString()
    @IsNotEmpty()
      start_date: string;

    @IsString()
    @IsNotEmpty()
      end_date: string;

    @IsNumber()
    @IsNotEmpty()
      per_user_limit: number;

    @IsNumber()
    @IsNotEmpty()
      total_usage_limit: number;
}

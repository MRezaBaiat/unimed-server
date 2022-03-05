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
      startDate: string;

    @IsString()
    @IsNotEmpty()
      endDate: string;

    @IsNumber()
    @IsNotEmpty()
      perUserLimit: number;

    @IsNumber()
    @IsNotEmpty()
      totalUsageLimit: number;
}

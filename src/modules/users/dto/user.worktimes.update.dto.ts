import { IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ResponseTime } from 'api';

export default class UserWorkTimesUpdateDto {
    @IsNotEmpty()
    @Type(() => ResponseTime)
    0: ResponseTime[];

    @IsNotEmpty()
    @Type(() => ResponseTime)
    1: ResponseTime[];

    @IsNotEmpty()
    @Type(() => ResponseTime)
    2: ResponseTime[];

    @IsNotEmpty()
    @Type(() => ResponseTime)
    3: ResponseTime[];

    @IsNotEmpty()
    @Type(() => ResponseTime)
    4: ResponseTime[];

    @IsNotEmpty()
    @Type(() => ResponseTime)
    5: ResponseTime[];

    @IsNotEmpty()
    @Type(() => ResponseTime)
    6: ResponseTime[];
}

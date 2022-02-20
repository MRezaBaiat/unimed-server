import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export default class DoctorPostVisitDto {
    @IsString()
    @IsNotEmpty()
      visitId: string;

    @IsBoolean()
    @IsNotEmpty()
      returnCost: boolean;
}

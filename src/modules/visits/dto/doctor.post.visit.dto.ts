import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export default class DoctorPostVisitDto {
    @IsString()
    @IsNotEmpty()
    visit_id: string;

    @IsBoolean()
    @IsNotEmpty()
    return_cost: boolean;
}

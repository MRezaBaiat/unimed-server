import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export default class PatientPostVisitDto {
    @IsNotEmpty()
    @IsNumber()
    service_quality: number;

    @IsNotEmpty()
    @IsNumber()
    video_call_satisfaction: number;

    @IsNotEmpty()
    @IsNumber()
    doctor_details_clearity: number;

    @IsNotEmpty()
    @IsNumber()
    doctor_solutions: number;

    @IsNotEmpty()
    @IsNumber()
    doctor_detailed_consequences: number;

    @IsNotEmpty()
    @IsNumber()
    environment_details: number;

    @IsNotEmpty()
    @IsString()
    visitId: string;
}

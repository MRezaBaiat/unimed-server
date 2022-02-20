import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export default class PatientPostVisitDto {
    @IsNotEmpty()
    @IsNumber()
      serviceQuality: number;

    @IsNotEmpty()
    @IsNumber()
      videoCallSatisfaction: number;

    @IsNotEmpty()
    @IsNumber()
      doctorDetailsClearity: number;

    @IsNotEmpty()
    @IsNumber()
      doctorSolutions: number;

    @IsNotEmpty()
    @IsNumber()
      doctorDetailedConsequences: number;

    @IsNotEmpty()
    @IsNumber()
      environmentDetails: number;

    @IsNotEmpty()
    @IsString()
      visitId: string;
}

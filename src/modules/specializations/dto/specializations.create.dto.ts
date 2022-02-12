import { IsNotEmpty, IsString } from 'class-validator';

export default class SpecializationsCreateDto {
    @IsNotEmpty()
    @IsString()
    name: string;
}

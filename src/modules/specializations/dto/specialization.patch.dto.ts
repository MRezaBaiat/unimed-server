import { IsNotEmpty, IsString } from 'class-validator';

export default class SpecializationPatchDto {
    @IsNotEmpty()
    @IsString()
    _id: string;

    @IsNotEmpty()
    @IsString()
    name: string;
}

import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMobilePhone,
  IsNotEmpty,
  IsNumber, IsObject, IsOptional,
  IsString,
  Matches
} from 'class-validator';
import { ResponseTime, Specialization, UserType, WorkTimes } from 'api';
import { Type } from 'class-transformer';

class SpecializationType {
    @IsString()
    @IsNotEmpty()
    _id: string;

    @IsString()
    @IsNotEmpty()
    name: string;
}

class NotificationSettings {
    @IsBoolean()
    @IsNotEmpty()
    notification:boolean;

    @IsBoolean()
    @IsNotEmpty()
    sms!:boolean
}

class SettingsType {
    @IsNotEmpty()
    @IsObject()
    notifications: {
        newPatient: NotificationSettings,
        workTimeClose: NotificationSettings,
        workTimeEnded: NotificationSettings,
        workTimeStarted: NotificationSettings
    }
}

class ReservationCoordinatesType {
    @IsNumber()
    lat: number;

    @IsNumber()
    lng: number
}

class ReservationInfoDetailsType {
    @IsBoolean()
    @IsNotEmpty()
    enabled: boolean;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsNumber()
    @IsNotEmpty()
    gapMinutes: number;

    @IsString()
    @IsNotEmpty()
    cost: string;

    @IsOptional()
    @IsObject()
    coordinates:ReservationCoordinatesType;

    @IsNotEmpty()
    @IsObject()
    workTimes: WorkTimes
}

class DetailsType {
    @IsObject()
    @IsNotEmpty()
    reservationInfo!: ReservationInfoDetailsType;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsBoolean()
    @IsNotEmpty()
    videoCallAllowed: boolean;

    @IsString()
    @IsNotEmpty()
    bio: string;

    @IsBoolean()
    @IsNotEmpty()
    displayInList: boolean;

    @IsNumber()
    @IsNotEmpty()
    maxVisitDurationMillisec: number;

    @IsString()
    @IsNotEmpty()
    city: string;

    @IsString()
    @IsNotEmpty()
    shaba:string;

    @IsString()
    @IsOptional()
    nezam_pezeshki_code:string;

    @IsNumber()
    cut: number;

    @IsArray()
    @IsNotEmpty()
    clinics:string[];

    @IsArray()
    @IsNotEmpty()
    hospitals:string[];

    @IsObject()
    @IsNotEmpty()
    response_days: {
        0: ResponseTime[],
        1: ResponseTime[],
        2: ResponseTime[],
        3: ResponseTime[],
        4: ResponseTime[],
        5: ResponseTime[],
        6: ResponseTime[],
    }
}

export default class DoctorCreateDto {
    @IsNotEmpty()
    @IsString()
    @IsMobilePhone()
    mobile: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    @Matches(UserType.DOCTOR)
    type: UserType.DOCTOR;

    @IsNumber()
    @IsNotEmpty()
    code: number;

    @IsNumber()
    @IsNotEmpty()
    price: number;

    @IsString()
    @IsNotEmpty()
    gender: 'male' | 'female' | '';

    @IsNotEmpty()
    @Type(() => SpecializationType)
    specialization: Specialization;

    @IsNotEmpty()
    @IsObject()
    settings: SettingsType;

    @IsNotEmpty()
    @IsObject()
    details:DetailsType;
}

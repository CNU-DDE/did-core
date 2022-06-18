import {
    IsInt,
    IsNumber,
    IsString,
    IsDefined,
    IsNotEmptyObject,
    IsObject,
    ValidateNested,
    IsArray,
    IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsDID } from 'src/utils/validation.util';
import { did_t, career_t, mariaId_t } from 'did-core';
import { KeystoreDto } from 'src/ssi/dto/keystore.dto';
import { CareerType } from 'src/domain/enums.domain';

export class CareerEntryDto {
    @IsEnum(CareerType)
    careerType: CareerType;

    @IsString()
    content:    career_t;
}

export class PostResumeDto {
    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => KeystoreDto)
    keystore: KeystoreDto;

    @IsDID()
    verifier: did_t;

    @IsString()
    title: string;

    @IsInt()
    positionId: mariaId_t;

    @IsNumber({}, { each: true })
    coverLetterIds: mariaId_t[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CareerEntryDto)
    careers: CareerEntryDto[];
}

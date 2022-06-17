import {
    IsInt,
    IsNumber,
    IsString,
    Min,
    IsDefined,
    IsNotEmptyObject,
    IsObject,
    ValidateNested,
    IsArray,
    IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsDID } from 'src/validateutils';
import { did_t, positionId_t, coverLetterId_t, careerType_t, career_t } from 'did-core';
import { KeystoreDto } from 'src/claims/dto/nested/keystore.dto';
import Const from 'src/config/const.config';

export class CareerEntryDto {
    @IsInt()
    @IsIn([ Const.CAREER_TYPE_VC, Const.CAREER_TYPE_IPFS_HASH ])
    careerType: careerType_t;

    @IsString()
    content:    career_t;
}

export class CreateResumeDto {
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
    @Min(0)
    positionId: positionId_t;

    @IsNumber({}, { each: true })
    coverLetterIds: coverLetterId_t[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CareerEntryDto)
    careers: CareerEntryDto[];
}

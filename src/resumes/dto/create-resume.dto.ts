import {
    IsInt,
    IsNumber,
    IsString,
    Min,
    IsDefined,
    IsNotEmptyObject,
    IsObject,
    ValidateNested,
    IsOptional,
    IsJWT,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsDID } from 'src/validateutils';
import { did_t, positionId_t, coverLetterId_t, vpJwt_t, ipfsHash_t } from 'did-core';

export class CareersDto {
    @IsOptional()
    @IsJWT()
    vp: vpJwt_t;

    @IsOptional()
    @IsString({ each: true })
    smartCareers: ipfsHash_t[];
}

export class CreateResumeDto {
    @IsDID()
    owner: did_t;

    @IsDID()
    verifier: did_t;

    @IsString()
    title: string;

    @IsInt()
    @Min(0)
    positionId: positionId_t;

    @IsOptional()
    @IsNumber({}, { each: true })
    coverLetterIds: coverLetterId_t[];

    @IsOptional()
    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => CareersDto)
    careers: CareersDto;
}

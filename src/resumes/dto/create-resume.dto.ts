import {
    IsInt,
    IsNumber,
    IsString,
    IsDefined,
    IsNotEmptyObject,
    IsObject,
    ValidateNested,
    IsOptional,
    IsJWT,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsDID } from 'src/utils/validation.util';
import { did_t, vpJwt_t, ipfsHash_t, mariaId_t } from 'did-core';

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
    positionId: mariaId_t;

    @IsOptional()
    @IsNumber({}, { each: true })
    coverLetterIds: mariaId_t[];

    @IsOptional()
    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => CareersDto)
    careers: CareersDto;
}

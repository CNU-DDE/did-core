import {
    IsString,
    IsDefined,
    IsObject,
    IsNotEmptyObject,
    ValidateNested,
} from 'class-validator'
import { IsDID } from 'src/validateutils';
import { Type } from 'class-transformer';
import { did_t, claimStatus_t, careerType_t, career_t } from 'did-core';
import { ClaimContentDto } from '../nested/claim-content.dto';

export class BaseClaimDto {
    // -------------------------
    // Required fields
    // -------------------------
    @IsDID()
    readonly owner: did_t;

    @IsDID()
    readonly issuer: did_t;

    @IsString()
    readonly title: string;

    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => ClaimContentDto)
    readonly content: ClaimContentDto;
}

export interface BaseClaimInterface {
    // -------------------------
    // Validate enforced fields
    // -------------------------
    readonly status:        claimStatus_t;
    readonly careerType:    careerType_t;
    readonly career:        career_t;
}

import {
    IsString,
    IsDefined,
    IsObject,
    IsNotEmptyObject,
    ValidateNested,
} from 'class-validator'
import { IsDID } from 'src/utils/validation.util';
import { Type } from 'class-transformer';
import { did_t, career_t } from 'did-core';
import { ClaimContentDto } from '../nested/claim-content.dto';
import { ClaimStatus, CareerType } from 'src/domain/enums.domain';

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
    readonly status:        ClaimStatus;
    readonly careerType:    CareerType;
    readonly career:        career_t;
}

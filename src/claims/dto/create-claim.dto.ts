import {
    IsString,
    IsDefined,
    IsObject,
    IsNotEmptyObject,
    ValidateNested,
    IsInt,
    IsIn,
} from 'class-validator'
import { IsDID } from 'src/validateutils';
import { Type } from 'class-transformer';
import { did_t } from 'did-core';
import { ClaimContentDto } from './claim-content.dto';
import { CAREER_TYPE_VC_LITERAL } from 'did-core';
import Const from 'src/config/const.config';

export class CreateClaimDto {

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

    // -------------------------
    // Enforced fields
    // -------------------------
    @IsInt()
    @IsIn([Const.CAREER_TYPE_VC])
    readonly careerType: CAREER_TYPE_VC_LITERAL;

    // -------------------------
    // Handled by default
    // -------------------------

    // @IsInt()
    // @IsIn([Const.CLAIM_STATUS_PENDING])
    // readonly status: CLAIM_STATUS_PENDING_LITERAL;

    // @IsString()
    // @IsEmpty()
    // readonly career: "";
}

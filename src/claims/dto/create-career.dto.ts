import {
    IsString,
    IsDefined,
    IsObject,
    IsNotEmptyObject,
    ValidateNested,
    IsInt,
    IsIn,
    IsHash,
} from 'class-validator'
import { IsDID } from 'src/validateutils';
import { Type } from 'class-transformer';
import { did_t } from 'did-core';
import { ClaimContentDto } from './claim-content.dto';
import Const from 'src/config/const.config';
import { CLAIM_STATUS_ACCEPTED_LITERAL, CAREER_TYPE_IPFS_HASH_LITERAL } from 'did-core';

export class CreateCareerDto {

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
    @IsIn([Const.CLAIM_STATUS_ACCEPTED])
    readonly status: CLAIM_STATUS_ACCEPTED_LITERAL;

    @IsInt()
    @IsIn([Const.CAREER_TYPE_IPFS_HASH])
    readonly careerType: CAREER_TYPE_IPFS_HASH_LITERAL;

    @IsString()
    @IsHash("sha256")
    readonly career: string;
}

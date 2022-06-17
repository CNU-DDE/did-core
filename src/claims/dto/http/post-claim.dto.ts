import {
    IsIn,
    IsInt,
    IsHash,
    IsString,
    IsDefined,
    IsNotEmptyObject,
    IsObject,
    ValidateNested,
    IsOptional,
} from 'class-validator'
import { IsDID } from 'src/validateutils';
import { Type } from 'class-transformer';
import { career_t, CAREER_TYPE_IPFS_HASH_LITERAL, did_t } from 'did-core';
import { ClaimContentDto } from '../nested/claim-content.dto';
import Const from 'src/config/const.config';
import { careerType_t } from 'did-core';

export class PostClaimDto {

    // -------------------------
    // Common requirement
    // -------------------------
    @IsDID()
    readonly issuer: did_t;

    @IsString()
    readonly title: string;

    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => ClaimContentDto)
    readonly claim: ClaimContentDto;

    @IsInt()
    @IsIn([Const.CAREER_TYPE_VC, Const.CAREER_TYPE_IPFS_HASH])
    readonly careerType: careerType_t;

    // -------------------------
    // Required only for IPFS_HASH type
    // -------------------------
    @IsOptional()
    @IsInt()
    @IsIn([Const.CAREER_TYPE_IPFS_HASH])
    readonly status: CAREER_TYPE_IPFS_HASH_LITERAL;

    @IsOptional()
    @IsDID()
    readonly owner: did_t;

    @IsOptional()
    @IsHash("sha256")
    readonly career: career_t;
}

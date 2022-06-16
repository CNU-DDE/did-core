import {
    IsString,
    IsInt,
    IsIn,
    IsHash,
} from 'class-validator'
import Const from 'src/config/const.config';
import {
    career_t,
    CLAIM_STATUS_ACCEPTED_LITERAL,
    CAREER_TYPE_IPFS_HASH_LITERAL
} from 'did-core';
import {BaseClaimDto, BaseClaimInterface} from './base-claim.dto';

export class CreateCareerDto extends BaseClaimDto implements BaseClaimInterface {
    // -------------------------
    // Implemented fields
    // -------------------------
    @IsInt()
    @IsIn([Const.CLAIM_STATUS_ACCEPTED])
    readonly status: CLAIM_STATUS_ACCEPTED_LITERAL;

    @IsInt()
    @IsIn([Const.CAREER_TYPE_IPFS_HASH])
    readonly careerType: CAREER_TYPE_IPFS_HASH_LITERAL;

    @IsString()
    @IsHash("sha256")
    readonly career: career_t;
}

import {
    IsIn,
    IsEmpty,
    IsString,
    IsHash,
    IsEnum,
} from 'class-validator'
import { ipfsHash_t } from 'did-core';
import { CareerType, ClaimStatus } from 'src/domain/enums.domain';
import { BaseClaimDto, BaseClaimInterface } from './base-claim.dto';

export class CreateClaimDto extends BaseClaimDto implements BaseClaimInterface {

    // -------------------------
    // Extended fields
    // -------------------------
    @IsEnum(CareerType)
    @IsIn([CareerType.ENC_VC])
    readonly careerType: CareerType.ENC_VC;

    // -------------------------
    // Handled by default
    // -------------------------
    @IsEmpty()
    readonly status: undefined;

    @IsEmpty()
    readonly career: undefined;
}

export class CreateCareerDto extends BaseClaimDto implements BaseClaimInterface {
    // -------------------------
    // Implemented fields
    // -------------------------
    @IsEnum(ClaimStatus)
    @IsIn([ClaimStatus.ACCEPTED])
    readonly status: ClaimStatus.ACCEPTED;

    @IsEnum(CareerType)
    @IsIn([CareerType.IPFS_HASH])
    readonly careerType: CareerType.IPFS_HASH;

    @IsString()
    @IsHash("sha256")
    readonly career: ipfsHash_t;
}

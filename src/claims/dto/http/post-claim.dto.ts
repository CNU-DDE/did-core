import {
    IsHash,
    IsString,
    IsDefined,
    IsNotEmptyObject,
    IsObject,
    ValidateNested,
} from 'class-validator'
import { IsDID } from 'src/utils/validation.util';
import { Type } from 'class-transformer';
import { did_t, ipfsHash_t } from 'did-core';
import { ClaimContentDto } from '../nested/claim-content.dto';

export class CommonDto {
    // -------------------------
    // Common requirement
    // -------------------------
    @IsString()
    readonly title: string;

    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => ClaimContentDto)
    readonly claim: ClaimContentDto;
}

export class PostClaimDto extends CommonDto {
    // -------------------------
    // VC Claim requirement
    // -------------------------

    @IsDID()
    readonly issuer: did_t;
}

export class PostContractDto extends CommonDto {
    // -------------------------
    // IPFS_HASH requirement
    // -------------------------
    @IsDID()
    readonly owner: did_t;

    @IsHash("sha256")
    readonly career: ipfsHash_t;
}

export type PostDto = PostClaimDto|PostContractDto;

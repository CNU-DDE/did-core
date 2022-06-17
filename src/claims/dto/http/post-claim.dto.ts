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
import { career_t, did_t } from 'did-core';
import { ClaimContentDto } from '../nested/claim-content.dto';

export class CommonClaimDto {
    // -------------------------
    // Common requirement
    // -------------------------
    @IsDID()
    readonly issuer: did_t;

    @IsString()
    readonly title: string;
}

export class PostClaimDto extends CommonClaimDto {
    // -------------------------
    // VC Claim requirement
    // -------------------------
    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => ClaimContentDto)
    readonly claim: ClaimContentDto;
}

export class PostCareerDto extends CommonClaimDto {
    // -------------------------
    // IPFS_HASH requirement
    // -------------------------
    @IsDID()
    readonly owner: did_t;

    @IsHash("sha256")
    readonly career: career_t;
}

export type PostDto = PostClaimDto|PostCareerDto;

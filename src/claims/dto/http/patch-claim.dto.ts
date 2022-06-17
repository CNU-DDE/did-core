import {
    IsInt,
    IsDefined,
    IsNotEmptyObject,
    IsObject,
    ValidateNested,
    IsOptional,
    IsIn,
} from 'class-validator'
import { Type } from 'class-transformer';
import { KeystoreDto } from '../nested/keystore.dto';
import Const from 'src/config/const.config';
import { claimStatus_t } from 'did-core';

export class PatchClaimDto {
    @IsInt()
    @IsIn([Const.CLAIM_STATUS_ACCEPTED, Const.CLAIM_STATUS_REJECTED])
    readonly status: claimStatus_t;

    @IsOptional()
    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => KeystoreDto)
    readonly keystore: KeystoreDto;
}

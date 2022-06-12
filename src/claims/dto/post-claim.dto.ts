import {
    IsString,
    IsDefined,
    IsNotEmptyObject,
    IsObject,
    Contains,
    ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer';
import { did_t } from 'did-core';
import { ClaimContentDto } from './claim-content.dto';

export class PostClaimDto {
    @IsString()
    @Contains('did:')
    issuer: did_t;

    @IsString()
    title: string;

    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => ClaimContentDto)
    claim: ClaimContentDto;
}

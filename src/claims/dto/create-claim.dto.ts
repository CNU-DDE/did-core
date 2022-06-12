import {
    IsString,
    IsDefined,
    IsObject,
    IsNotEmptyObject,
    Contains,
    ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer';
import { did_t } from 'did-core';
import { ClaimContentDto } from './claim-content.dto';

export class CreateClaimDto {
    @IsString()
    @Contains('did:')
    owner: did_t;

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
    content: ClaimContentDto;
}

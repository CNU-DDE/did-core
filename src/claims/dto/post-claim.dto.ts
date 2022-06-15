import {
    IsString,
    IsDefined,
    IsNotEmptyObject,
    IsObject,
    ValidateNested,
} from 'class-validator'
import { IsDID } from 'src/validateutils';
import { Type } from 'class-transformer';
import { did_t } from 'did-core';
import { ClaimContentDto } from './claim-content.dto';

export class PostClaimDto {
    @IsDID()
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

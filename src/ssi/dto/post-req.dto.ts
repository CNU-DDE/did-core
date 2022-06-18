import {
    IsHexadecimal,
    IsJWT,
    IsDefined,
    IsNotEmptyObject,
    IsObject,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ClaimContentDto } from 'src/claims/dto/nested/claim-content.dto';
import { IsDID } from 'src/utils/validation.util';
import * as dts from 'did-core';

export class PostVerifiableCredentialDto {
    @IsDID()
    holderDID:  dts.did_t;

    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => ClaimContentDto)
    claim:      ClaimContentDto;

    @IsDID()
    issuerDID:  dts.did_t;

    @IsHexadecimal()
    issuerPriv: dts.privKey_t;
}

export class PostVerifiablePresentationDto {
    @IsDID()
    holderDID:              dts.did_t;

    @IsHexadecimal()
    holderPriv:             dts.privKey_t;

    @IsJWT({ each: true })
    verifiableCredentials:  dts.vcJwt_t[];
}

export class PostVerifiedCredentialDto {
    @IsJWT()
    verifiableCredential:   dts.vcJwt_t;
}

export class PostVerifiedPresentationDto {
    @IsJWT()
    verifiablePresentation: dts.vpJwt_t;
}

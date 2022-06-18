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
import {
    did_t,
    privKey_t,
    vcJwt_t,
    vpJwt_t,
} from 'did-core';

export class PostVerifiableCredentialDto {
    @IsDID()
    holderDID:  did_t;

    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => ClaimContentDto)
    claim:      ClaimContentDto;

    @IsDID()
    issuerDID:  did_t;

    @IsHexadecimal()
    issuerPriv: privKey_t;
}

export class PostVerifiablePresentationDto {
    @IsDID()
    holderDID:              did_t;

    @IsHexadecimal()
    holderPriv:             privKey_t;

    @IsJWT({ each: true })
    verifiableCredentials:  vcJwt_t[];
}

export class PostVerifiedCredentialDto {
    @IsJWT()
    verifiableCredential:   vcJwt_t;
}

export class PostVerifiedPresentationDto {
    @IsJWT()
    verifiablePresentation: vpJwt_t;
}

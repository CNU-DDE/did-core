import { IsHexadecimal } from 'class-validator';
import { IsDID } from 'src/utils/validation.util';
import { did_t, address_t, pubKey_t, privKey_t } from 'did-core';

export class KeystoreDto {
    @IsDID()
    readonly did:           did_t;

    @IsHexadecimal()
    readonly walletAddress: address_t;

    @IsHexadecimal()
    readonly privKey:       privKey_t;

    @IsHexadecimal()
    readonly pubKey:        pubKey_t;
}

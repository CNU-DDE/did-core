import { IsHexString, IsDID } from 'src/validateutils';

export class KeystoreDto {
    @IsDID()
    readonly did: string;

    @IsHexString()
    readonly walletAddress: string;

    @IsHexString()
    readonly privKey: string;

    @IsHexString()
    readonly pubKey: string;
}

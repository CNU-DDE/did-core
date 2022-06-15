import { IsHexadecimal } from 'class-validator';
import { IsDID } from 'src/validateutils';

export class KeystoreDto {
    @IsDID()
    readonly did: string;

    @IsHexadecimal()
    readonly walletAddress: string;

    @IsHexadecimal()
    readonly privKey: string;

    @IsHexadecimal()
    readonly pubKey: string;
}

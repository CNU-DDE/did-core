import {
    IsInt,
    IsDefined,
    IsNotEmptyObject,
    IsObject,
    ValidateNested,
    Min,
    Max,
    IsOptional,
} from 'class-validator'
import { Type } from 'class-transformer';
import { KeystoreDto } from './keystore.dto';

export class PatchClaimDto {
    @IsInt()
    @Min(1)
    @Max(2)
    status: number;

    @IsOptional()
    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => KeystoreDto)
    keystore: KeystoreDto;
}

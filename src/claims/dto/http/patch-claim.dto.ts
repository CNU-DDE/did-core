import {
    IsDefined,
    IsNotEmptyObject,
    IsObject,
    ValidateNested,
    IsOptional,
    IsIn,
    IsEnum,
} from 'class-validator'
import { Type } from 'class-transformer';
import { KeystoreDto } from 'src/ssi/dto/keystore.dto';
import {ClaimStatus} from 'src/domain/enums.domain';

export class PatchClaimDto {
    @IsEnum(ClaimStatus)
    @IsIn([ClaimStatus.ACCEPTED, ClaimStatus.REJECTED])
    readonly status: ClaimStatus.ACCEPTED|ClaimStatus.REJECTED;

    @IsOptional()
    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => KeystoreDto)
    readonly keystore: KeystoreDto;
}

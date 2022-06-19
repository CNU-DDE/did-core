import { encVc_t } from "did-core";
import { IsBase64, IsEnum, IsIn, IsString } from "class-validator";
import { ClaimStatus } from "src/domain/enums.domain";

export class UpdateClaimToAcceptedDto {
    @IsEnum(ClaimStatus)
    @IsIn([ClaimStatus.ACCEPTED])
    status: ClaimStatus.ACCEPTED;

    @IsString()
    @IsBase64()
    career: encVc_t;
}

export class UpdateClaimToRejectedDto {
    @IsEnum(ClaimStatus)
    @IsIn([ClaimStatus.REJECTED])
    status: ClaimStatus.REJECTED;
}

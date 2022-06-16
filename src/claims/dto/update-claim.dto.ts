import {
    career_t,
    CLAIM_STATUS_ACCEPTED_LITERAL,
    CLAIM_STATUS_REJECTED_LITERAL,
} from "did-core";
import {IsBase64, IsIn, IsInt, IsString} from "class-validator";
import Const from "src/config/const.config";

export class UpdateClaimToAcceptedDto {
    @IsInt()
    @IsIn([Const.CLAIM_STATUS_ACCEPTED])
    status: CLAIM_STATUS_ACCEPTED_LITERAL;

    @IsString()
    @IsBase64()
    career: career_t;
}

export class UpdateClaimToRejectedDto {
    @IsInt()
    @IsIn([Const.CLAIM_STATUS_REJECTED])
    status: CLAIM_STATUS_REJECTED_LITERAL;
}

import {
    IsInt,
    IsIn,
    IsEmpty,
} from 'class-validator'
import {
    CAREER_TYPE_VC_LITERAL,
} from 'did-core';
import Const from 'src/config/const.config';
import { BaseClaimDto, BaseClaimInterface } from './base-claim.dto';

export class CreateClaimDto extends BaseClaimDto implements BaseClaimInterface {

    // -------------------------
    // Extended fields
    // -------------------------
    @IsInt()
    @IsIn([Const.CAREER_TYPE_VC])
    readonly careerType: CAREER_TYPE_VC_LITERAL;

    // -------------------------
    // Handled by default
    // -------------------------
    @IsEmpty()
    readonly status: undefined;

    @IsEmpty()
    readonly career: undefined;
}

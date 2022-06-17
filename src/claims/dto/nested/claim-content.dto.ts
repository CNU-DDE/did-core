import { IsString } from 'class-validator'

export class ClaimContentDto {
    @IsString()
    readonly from: string;

    @IsString()
    readonly to: string;

    @IsString()
    readonly where: string;

    @IsString()
    readonly what: string;
}

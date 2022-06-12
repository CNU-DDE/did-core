import {
    Controller,
    Post,
    Body,
} from '@nestjs/common';
import { ClaimsService } from './claims.service';
import { PostClaimDto } from './dto/post-claim.dto';

@Controller('claims')
export class ClaimsController {
    constructor(private readonly claimsService: ClaimsService) {}

    @Post()
    async create(@Body() claimsData : PostClaimDto) {
        return await this.claimsService.create({
            owner: "did:",
            issuer: claimsData.issuer,
            title: claimsData.title,
            content: claimsData.claim,
        });
    }
}

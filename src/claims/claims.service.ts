import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Claim } from './schemas/claim.schema';
import { PostClaimDto } from './dto/post-claim.dto';
import { sendBroccoliGetRequest } from 'src/httputils';
import { PermissionDeniedError } from 'src/errors';

@Injectable()
export class ClaimsService {
    constructor(@InjectModel(Claim.name) private claimModel: Model<Claim>) {}

    async create(
        claimsData:     PostClaimDto,
        accessToken:    string,
    ) {
        const holderValidation = await sendBroccoliGetRequest("/user/self", accessToken);
        const holder = holderValidation.data.user_info;

        // Validate holder
        if(holder.user_type != 1) {
            throw new PermissionDeniedError()
        }

        const issuerValidation = await sendBroccoliGetRequest("/user/" + claimsData.issuer, accessToken)
        const issuer = issuerValidation.data.user_info;

        // Validate issuer
        if(issuer.user_type != 0) {
            throw new PermissionDeniedError()
        }

        // Create claim
        this.claimModel.create({
            owner:      holder.did,
            issuer:     issuer.did,
            title:      claimsData.title,
            content:    claimsData.claim,
        });
    }
}

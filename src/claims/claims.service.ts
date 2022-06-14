import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Claim } from './schemas/claim.schema';
import { PostClaimDto } from './dto/post-claim.dto';
import { sendBroccoliGetRequest } from 'src/httputils';
import { PermissionDeniedError } from 'src/errors';
import { EMPLOYER_USER_TYPE, EMPLOYEE_USER_TYPE } from 'src/config/constants';
import * as dts from 'did-core';

@Injectable()
export class ClaimsService {
    constructor(@InjectModel(Claim.name) private claimModel: Model<Claim>) {}

    /**
     * Create claim
     * @param   claimsData:     PostClaimDto
     * @param   accessToken:    string
     */
    async create(
        claimsData:     PostClaimDto,
        accessToken:    string,
    ) {
        // Validate holder
        const holder = (await sendBroccoliGetRequest("/user/self", accessToken))
        .data.user_info;

        if(holder.user_type != EMPLOYEE_USER_TYPE) {
            throw new PermissionDeniedError()
        }

        // Validate issuer
        const issuer = (await sendBroccoliGetRequest("/user/" + claimsData.issuer, accessToken))
        .data.user_info;

        if(issuer.user_type != EMPLOYER_USER_TYPE) {
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

    /**
     * Get all claims for user
     * @param   accessToken:    string
     */
    async getAll(
        accessToken:    string
    ): Promise<dts.ClaimMinimumInterface[]> {

        // Get user info
        const user = (await sendBroccoliGetRequest("/user/self", accessToken))
        .data.user_info;

        // For employer
        if(user.user_type == EMPLOYER_USER_TYPE) {
            const employersClaim = await this.claimModel.find({
                issuer: user.did,
                status: 0,
            }).exec();

            return employersClaim.map((claim) => ({
                id: claim._id,
                holder: {
                    did: user.did,
                    display_name: user.display_name,
                },
                title: claim.title,
            }));
        }

        // For employee
        const employeesClaim = await this.claimModel.find({
            owner: user.did,
        }).exec();

        const ret = [];
        for(const claim of employeesClaim) {

            // Get issuer info
            const issuer = (await sendBroccoliGetRequest("/user/" + claim.issuer, accessToken))
            .data.user_info;

            ret.push({
                id: claim._id,
                issuer: {
                    did: issuer.did,
                    display_name: issuer.display_name,
                },
                title: claim.title,
            });
        }
        return ret;
    }
}

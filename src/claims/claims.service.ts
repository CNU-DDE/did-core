import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Claim } from './schemas/claim.schema';
import { PostClaimDto } from './dto/post-claim.dto';
import { sendBroccoliGetRequest } from 'src/httputils';
import { PermissionDeniedError } from 'src/errors';
import Const from 'src/config/const.config';
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

        if(holder.user_type != Const.EMPLOYEE_USER_TYPE) {
            throw new PermissionDeniedError()
        }

        // Validate issuer
        const issuer = (await sendBroccoliGetRequest("/user/" + claimsData.issuer, accessToken))
        .data.user_info;

        if(issuer.user_type != Const.EMPLOYER_USER_TYPE) {
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
        if(user.user_type == Const.EMPLOYER_USER_TYPE) {
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
                status: claim.status,
            });
        }
        return ret;
    }

    /**
     * Get a claim for user
     * @param   accessToken:    string
     */
    async getOne(
        claimId:        string,
        accessToken:    string,
    ): Promise<dts.ClaimDetailInterface> {

        // Get user info
        const user = (await sendBroccoliGetRequest("/user/self", accessToken))
        .data.user_info;

        // For employer
        if(user.user_type == Const.EMPLOYER_USER_TYPE) {

            // Get claim
            const claims = await this.claimModel.find({
                id:     claimId,
                issuer: user.did,
                status: 0,
            });

            // A claim must be searched
            if(claims.length == 0) {
                throw new PermissionDeniedError();
            }

            // Get holder
            const holder = (await sendBroccoliGetRequest("/user/" + claims[0].owner, accessToken))
            .data.user_info as dts.UserDetailInterface;

            return {
                id: claims[0]._id,
                title: claims[0].title,
                claim: claims[0].content,
                holder,
            };
        }

        // For employee
        // Get claim
        const claims = await this.claimModel.find({
            id:     claimId,
            owner:  user.did,
        });

        // A claim must be searched
        if(claims.length == 0) {
            throw new PermissionDeniedError();
        }

        // Get issuer
        const issuer = (await sendBroccoliGetRequest("/user/" + claims[0].issuer, accessToken))
        .data.user_info as dts.UserDetailInterface;

        return {
            id:     claims[0]._id,
            title:  claims[0].title,
            claim:  claims[0].content,
            status: claims[0].status,
            vc:     claims[0].vc,
            issuer,
        };
    }
}

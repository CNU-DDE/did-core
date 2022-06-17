import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Claim } from './schemas/claim.schema';
import { sendBroccoliGetRequest } from 'src/httputils';
import { PermissionDeniedError, NotFoundError } from 'src/errors';
import { createVC } from 'src/did';
import { encrypt } from 'eciesjs';
import { CreateCareerDto, CreateClaimDto } from './dto/store/create-claim.dto';
import { UpdateClaimToAcceptedDto, UpdateClaimToRejectedDto } from './dto/store/update-claim.dto';
import Const from 'src/config/const.config';
import * as dts from 'did-core';
import {PostCareerDto, PostClaimDto, PostDto} from './dto/http/post-claim.dto';

@Injectable()
export class ClaimsService {
    constructor(@InjectModel(Claim.name) private claimModel: Model<Claim>) {}

    /**
     * Create claim
     * @param   accessToken:    accessToken_t
     * @param   body:           PostDto
     */
    async create(
        accessToken:    dts.accessToken_t,
        body:           PostDto
    ) {
        if (body["claim"]) {
            const {
                issuer,
                title,
                claim,
            } = body as PostClaimDto;

            // Validate holder
            const holder = (await sendBroccoliGetRequest("/user/self", accessToken))
            .data.user_info;

            if(holder.user_type != Const.EMPLOYEE_USER_TYPE) {
                throw new PermissionDeniedError()
            }

            // Validate issuer
            const issuerObj = (await sendBroccoliGetRequest("/user/" + issuer, accessToken))
            .data.user_info;

            if(issuerObj.user_type != Const.EMPLOYER_USER_TYPE) {
                throw new PermissionDeniedError()
            }

            // Create claim
            this.claimModel.create({
                owner:      holder.did,
                issuer:     issuerObj.did,
                title:      title,
                content:    claim,
                careerType: Const.CAREER_TYPE_VC,
            } as CreateClaimDto);
        } else if (body["career"]) {
            const {
                issuer,
                owner,
                title,
                career,
            } = body as PostCareerDto;

            // Validate employee(owner)
            const ownerObj = (await sendBroccoliGetRequest("/user/" + owner, accessToken))
            .data.user_info;

            if(ownerObj.user_type != Const.EMPLOYEE_USER_TYPE) {
                throw new PermissionDeniedError()
            }

            // Validate employer(issuer)
            const issuerObj = (await sendBroccoliGetRequest("/user/" + issuer, accessToken))
            .data.user_info;

            if(issuerObj.user_type != Const.EMPLOYER_USER_TYPE) {
                throw new PermissionDeniedError()
            }

            // TODO: mock data for career content
            const content = {
                from: "from",
                to: "to",
                where: "where",
                what: "what",
            }

            // Create claim
            this.claimModel.create({
                owner:      ownerObj.did,
                issuer:     issuerObj.did,
                title:      title,
                careerType: Const.CAREER_TYPE_IPFS_HASH,
                status:     Const.CLAIM_STATUS_ACCEPTED,
                content,
                career,
            } as CreateCareerDto);
        }
    }

    /**
     * Get all claims for user
     * @param   accessToken:    accessToken_t
     */
    async getAll(
        accessToken:    dts.accessToken_t,
    ): Promise<dts.ClaimMinimumInterface[]> {

        // Get user info
        const user = (await sendBroccoliGetRequest("/user/self", accessToken))
        .data.user_info;

        // For employer
        if(user.user_type == Const.EMPLOYER_USER_TYPE) {
            const claims = await this.claimModel.find({
                issuer: user.did,
                status: 0,
            }).exec();

            return claims.map((claim) => ({
                id:     claim._id,
                holder: claim.owner,
                title:  claim.title,
            }));
        }

        // For employee
        const claims = await this.claimModel.find({
            owner: user.did,
        }).exec();

        return claims.map((claim) => ({
            id:     claim._id,
            issuer: claim.issuer,
            title:  claim.title,
            status: claim.status,
        }));
    }

    /**
     * Get a claim for user
     * @param   claimId:        mongoId_t
     * @param   accessToken:    accessToken_t
     */
    async getOne(
        claimId:        dts.mongoId_t,
        accessToken:    dts.accessToken_t,
    ): Promise<dts.ClaimDetailInterface> {

        // Get user info
        const user = (await sendBroccoliGetRequest("/user/self", accessToken))
        .data.user_info;

        // Get claim
        const claim = await this.claimModel.findOne({ _id: claimId })
        .exec()
        .catch(() => null);

        if (!claim) {
            throw new NotFoundError();
        }

        // For employer
        if(user.user_type == Const.EMPLOYER_USER_TYPE) {

            if (claim.issuer != user.did) {
                throw new PermissionDeniedError();
            }

            return {
                id:     claim._id,
                holder: claim.owner,
                title:  claim.title,
                claim:  claim.content,
            };
        }

        // For employee
        if (claim.owner != user.did) {
            throw new PermissionDeniedError();
        }

        return {
            id:         claim._id,
            issuer:     claim.issuer,
            title:      claim.title,
            claim:      claim.content,
            status:     claim.status,
            careerType: claim.careerType,
            career:     claim.career,
        };
    }

    /**
     * Update claim
     * @param   claimId:        PatchClaimDto
     * @param   status:         PatchClaimDto
     * @param   keystore:       PatchClaimDto
     * @param   accessToken:    string
     */
    async updateVC(
        claimId:        dts.mongoId_t,
        status:         dts.claimStatus_t,
        keystore:       dts.KeystoreInterface,
        accessToken:    dts.accessToken_t,
    ) {
        // Validate issuer
        const issuer = (await sendBroccoliGetRequest("/user/self", accessToken))
        .data.user_info;

        // Issuer must be employer
        if (issuer.user_type != Const.EMPLOYER_USER_TYPE) {
            throw new PermissionDeniedError()
        }

        // Select a claim
        const claim = await this.claimModel.findOne({
            _id:         claimId,
            issuer:     issuer.did,
            status:     Const.CLAIM_STATUS_PENDING,
            careerType: Const.CAREER_TYPE_VC,
        })
        .exec()
        .catch(() => null);

        if (!claim) {
            throw new NotFoundError();
        }

        // For CLAIM_STATUS_REJECTED
        if (status == Const.CLAIM_STATUS_REJECTED) {

            // Update status and return
            await this.claimModel.findByIdAndUpdate({ _id: claimId }, {
                status: Const.CLAIM_STATUS_REJECTED,
            } as UpdateClaimToRejectedDto);
            return;
        }

        // For CLAIM_STATUS_ACCEPTED
        // Validate keystore
        if (issuer.did != keystore.did) {
            throw new PermissionDeniedError();
        }

        // Create VC
        const vc = Buffer.from(await createVC(
            claim.owner,        // Holder DID
            claim.content,       // Claim
            issuer.did,         // Issuer DID
            keystore.privKey,   // Issuer private key
        ));

        // TODO: Assuming that DID contains pubkey
        const holderPub = claim.owner.split(':')[3];

        // Update claim
        await this.claimModel.findByIdAndUpdate({ _id: claimId }, {
            status: Const.CLAIM_STATUS_ACCEPTED,
            career: encrypt(holderPub, vc).toString("base64"),
        } as UpdateClaimToAcceptedDto);
    }
}

import {
    sendBroccoliGetRequest,
    sendIPFSGetRequest,
} from 'src/utils/http.util';
import {
    ClaimMinimumInterface,
    ClaimDetailInterface,
    ClaimQueryInterface,
} from './dto/get-claim.iface';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Claim } from './schemas/claim.schema';
import { PermissionDeniedError, NotFoundError } from 'src/domain/errors.domain';
import { UserType, ClaimStatus, CareerType } from 'src/domain/enums.domain';
import { encrypt } from 'eciesjs';
import { CreateCareerDto, CreateClaimDto } from './dto/store/create-claim.dto';
import { UpdateClaimToAcceptedDto, UpdateClaimToRejectedDto } from './dto/store/update-claim.dto';
import { PostCareerDto, PostClaimDto, PostDto } from './dto/http/post-claim.dto';
import { KeystoreDto } from 'src/ssi/dto/keystore.dto';
import * as dts from 'did-core';
import {SsiService} from 'src/ssi/ssi.service';

@Injectable()
export class ClaimsService {
    constructor(
        @InjectModel(Claim.name) private claimModel: Model<Claim>,
        private readonly ssiService: SsiService,
    ) {}

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

            if(holder.user_type != UserType.EMPLOYEE) {
                throw new PermissionDeniedError()
            }

            // Validate issuer
            const issuerObj = (await sendBroccoliGetRequest("/user/" + issuer, accessToken))
            .data.user_info;

            if(issuerObj.user_type != UserType.EMPLOYER) {
                throw new PermissionDeniedError()
            }

            // Create claim
            this.claimModel.create({
                owner:      holder.did,
                issuer:     issuerObj.did,
                title:      title,
                content:    claim,
                careerType: CareerType.ENC_VC,
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

            if(ownerObj.user_type != UserType.EMPLOYEE) {
                throw new PermissionDeniedError()
            }

            // Validate employer(issuer)
            const issuerObj = (await sendBroccoliGetRequest("/user/" + issuer, accessToken))
            .data.user_info;

            if(issuerObj.user_type != UserType.EMPLOYER) {
                throw new PermissionDeniedError()
            }

            // Create claim
            this.claimModel.create({
                owner:      ownerObj.did,
                issuer:     issuerObj.did,
                title:      title,
                careerType: CareerType.IPFS_HASH,
                status:     ClaimStatus.ACCEPTED,
                content:    (await sendIPFSGetRequest(career)).data.content,
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
        careerType:     CareerType|undefined,
    ): Promise<ClaimMinimumInterface[]> {

        // Get user info
        const user = (await sendBroccoliGetRequest("/user/self", accessToken))
        .data.user_info;

        const query = {} as ClaimQueryInterface;

        // For employer
        if (user.user_type == UserType.EMPLOYER) {
            query.issuer = user.did;
        }

        // For employee
        if (user.user_type == UserType.EMPLOYEE) {
            query.owner = user.did;
        }

        // For careerType query
        if (careerType !== undefined) {
            query.careerType = careerType;
        }

        // Search claims
        return (await this.claimModel.find(query).exec())
        .map(claim => ({
            id:     claim._id,
            holder: claim.owner,
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
    ): Promise<ClaimDetailInterface> {

        // Get user info
        const user = (await sendBroccoliGetRequest("/user/self", accessToken))
        .data.user_info;

        // Get claim
        const claim = await this.claimModel.findOne({ _id: claimId })
        .exec().catch(() => null);

        if (!claim) {
            throw new NotFoundError();
        }

        // For employer
        if(user.user_type == UserType.EMPLOYER || claim.issuer != user.did) {
            throw new PermissionDeniedError();
        }

        // For employee
        if(user.user_type == UserType.EMPLOYEE || claim.owner != user.did) {
            throw new PermissionDeniedError();
        }

        return {
            id:         claim._id,
            holder:     claim.owner,
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
        status:         ClaimStatus,
        keystore:       KeystoreDto,
        accessToken:    dts.accessToken_t,
    ) {
        // Validate issuer
        const issuer = (await sendBroccoliGetRequest("/user/self", accessToken))
        .data.user_info;

        // Issuer must be employer
        if (issuer.user_type != UserType.EMPLOYER) {
            throw new PermissionDeniedError()
        }

        // Select a claim
        const claim = await this.claimModel.findOne({
            _id:         claimId,
            issuer:     issuer.did,
            status:     ClaimStatus.PENDING,
            careerType: CareerType.ENC_VC,
        })
        .exec()
        .catch(() => null);

        if (!claim) {
            throw new NotFoundError();
        }

        // For CLAIM_STATUS_REJECTED
        if (status == ClaimStatus.REJECTED) {

            // Update status and return
            await this.claimModel.findByIdAndUpdate({ _id: claimId }, {
                status: ClaimStatus.REJECTED,
            } as UpdateClaimToRejectedDto);
            return;
        }

        // For CLAIM_STATUS_ACCEPTED
        // Validate keystore
        if (issuer.did != keystore.did) {
            throw new PermissionDeniedError();
        }

        // Create VC
        const vc = Buffer.from(await this.ssiService.createVC(
            claim.owner,        // Holder DID
            claim.content,       // Claim
            issuer.did,         // Issuer DID
            keystore.privKey,   // Issuer private key
        ));

        // TODO: Assuming that DID contains pubkey
        const holderPub = claim.owner.split(':')[3];

        // Update claim
        await this.claimModel.findByIdAndUpdate({ _id: claimId }, {
            status: ClaimStatus.ACCEPTED,
            career: encrypt(holderPub, vc).toString("base64"),
        } as UpdateClaimToAcceptedDto);
    }
}

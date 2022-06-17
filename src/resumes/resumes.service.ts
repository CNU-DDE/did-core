import {
    PermissionDeniedError,
    ClientFaultError,
    NotFoundError,
} from 'src/domain/errors.domain';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { sendBroccoliGetRequest } from 'src/utils/http.util';
import { Resume } from './schema/resume.schema';
import { CreateResumeDto } from './dto/create-resume.dto';
import { CareerEntryDto } from './dto/post-resume.dto';
import { createVP, verifyVP } from 'src/utils/did.util';
import { CareerType, UserType } from 'src/domain/enums.domain';
import * as dts from 'did-core';

@Injectable()
export class ResumesService {
    constructor(@InjectModel(Resume.name) private resumeModel: Model<Resume>) {}

    /**
     * Create resume
     * @param   accessToken:    accessToken_t
     * @param   keystore:       KeystoreInterface
     * @param   verifier:       did_t
     * @param   title:          string
     * @param   positionId:     positionId_t
     * @param   coverLetterIds: coverLetterId_t[]
     * @param   careerArr:      CareerEntryDto[]
     */
    async create(
        accessToken:    dts.accessToken_t,
        keystore:       dts.KeystoreInterface,
        verifier:       dts.did_t,
        title:          string,
        positionId:     dts.mariaId_t,
        coverLetterIds: dts.mariaId_t[],
        careerArr:      CareerEntryDto[],
    ) {
        // Validate holder
        const holderObj = (await sendBroccoliGetRequest("/user/self", accessToken))
        .data.user_info;

        if(holderObj.user_type != UserType.EMPLOYEE) {
            // Client is not employee
            throw new PermissionDeniedError();
        } else if (holderObj.did != keystore.did) {
            // Wrong keystore
            throw new ClientFaultError();
        }

        // Validate verifier
        const verifierObj = (await sendBroccoliGetRequest("/user/" + verifier, accessToken))
        .data.user_info;

        if(verifierObj.user_type != UserType.EMPLOYER) {
            // Wrong resume submission
            throw new ClientFaultError();
        }

        // Get VC array
        const vcs = careerArr
        .filter(career => career.careerType == CareerType.ENC_VC)
        .map(career => career.content);

        // Get SmartCareer array
        const smartCareers = careerArr
        .filter(career => career.careerType == CareerType.IPFS_HASH)
        .map(career => career.content);

        const vp = vcs.length == 0 ? "" : await createVP(holderObj.did, keystore.privKey, vcs);

        // Get VP and SmartCareers
        const careers = { vp, smartCareers };

        // Create claim
        this.resumeModel.create({
            owner:      holderObj.did,
            verifier:   verifierObj.did,
            title,
            positionId,
            coverLetterIds,
            careers,
        } as CreateResumeDto);
    }

    /**
     * Get all resume for user
     * @param   accessToken:    accessToken_t
     * @param   positionId:     mariaId_t
     */
    async getAll(
        accessToken:    dts.accessToken_t,
        positionId:     dts.mariaId_t|undefined,
    ): Promise<dts.ResumeMinimumInterface[]> {

        // Get user info
        const user = (await sendBroccoliGetRequest("/user/self", accessToken))
        .data.user_info;

        // Position ID specified
        if (positionId) {
            // Only an employer can query with positionId
            if(user.user_type != UserType.EMPLOYER) {
                throw new PermissionDeniedError();
            }

            // Get resumes
            const resumes = await this.resumeModel.find({
                positionId,
                verifier: user.did,
            }).exec()

            // Serialize
            return resumes.map(resume => ({
                id:         resume._id,
                title:      resume.title,
                holder:     resume.owner,
            }));
        }

        // For employer
        if(user.user_type == UserType.EMPLOYER) {
            // Get resumes
            const resumes = await this.resumeModel.find({
                verifier: user.did,
            }).exec();

            // Serialize
            return resumes.map(resume => ({
                id:     resume._id,
                title:  resume.title,
                holder: resume.owner,
            }));
        }

        // For employee
        const resumes = await this.resumeModel.find({
            owner:  user.did,
        }).exec();

        return resumes.map(resume => ({
            id:         resume._id,
            title:      resume.title,
            verifier:   resume.verifier,
        }));
    }

    /**
     * Get a resume for an user
     * @param   resumeId:       mongoId_t
     * @param   accessToken:    accessToken_t
     */
    async getOne(
        resumeId:       dts.mongoId_t,
        accessToken:    dts.accessToken_t,
    ): Promise<dts.ResumeDetailInterface> {

        // Get user info
        const user = (await sendBroccoliGetRequest("/user/self", accessToken))
        .data.user_info;

        // Get a resume
        const resume = await this.resumeModel.findOne({ _id: resumeId })
        .exec()
        .catch(() => null);

        if (!resume) {
            throw new NotFoundError();
        }

        // Permission check
        if  ((user.user_type == UserType.EMPLOYER && resume.verifier != user.did) ||
            (user.user_type == UserType.EMPLOYEE && resume.owner != user.did)) {
            throw new PermissionDeniedError();
        }

        // Get VC
        const vcs = (await verifyVP(resume.careers.vp))
        .verifiablePresentation
        .verifiableCredential;

        // Serialize VCs
        const careers = vcs.map(vc => ({
            holder: vc.credentialSubject.id,
            verifier: vc.issuer.id,
            content: {
                from: vc.credentialSubject.from,
                to: vc.credentialSubject.to,
                where: vc.credentialSubject.where,
                what: vc.credentialSubject.what,
            },
            verify: vc.proof as dts.JWTProof,
            isVerified: true,
        } as dts.ResumeCareerEntryInterface));

        // TODO: resolve IPFS hash
        careers.push(resume.careers.smartCareers
        .map((sc: dts.ipfsHash_t) => ({
            holder: "holder",
            verifier: "verifier",
            content: {
                from: "from",
                to: "to",
                where: "where",
                what: "what",
            },
            verify: { type: "IPFS_HASH", hash: sc },
            isVerified: true,
        } as dts.ResumeCareerEntryInterface)));

        // Serialize
        return {
            id:             resume._id,
            owner:          resume.owner,
            verifier:       resume.verifier,
            title:          resume.title,
            positionId:     resume.positionId,
            coverLetterId:  resume.coverLetterIds,
            careers,
        };
    }
}

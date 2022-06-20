import {
    PermissionDeniedError,
    ClientFaultError,
    NotFoundError,
} from 'src/domain/errors.domain';
import {
    sendBroccoliGetRequest,
    sendIPFSGetRequest,
} from 'src/utils/http.util';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Resume } from './schema/resume.schema';
import { CreateResumeDto } from './dto/create-resume.dto';
import { CareerEntryDto } from './dto/post-resume.dto';
import { CareerType, UserType } from 'src/domain/enums.domain';
import { KeystoreDto } from 'src/ssi/dto/keystore.dto';
import * as dts from 'did-core';
import * as iface from './dto/get-resume.iface';
import {SsiService} from 'src/ssi/ssi.service';

@Injectable()
export class ResumesService {
    constructor(
        @InjectModel(Resume.name) private resumeModel: Model<Resume>,
        private readonly ssiService: SsiService,
    ) {}

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
        keystore:       KeystoreDto,
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

        const vp = vcs.length > 0
            ? await this.ssiService.createVP(holderObj.did, keystore.privKey, vcs)
            : "";

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
    ): Promise<iface.ResumeMinimumInterface[]> {

        // Get user info
        const user = (await sendBroccoliGetRequest("/user/self", accessToken))
        .data.user_info;

        // Gen search query
        const query = positionId !== undefined ? { verifier: user.did, positionId } // For a position
            : user.user_type === UserType.EMPLOYER ? { verifier: user.did }         // For an employer
            : { owner: user.did };                                                  // For an employee

        // Get resumes
        return (await this.resumeModel.find(query).exec())
        .map(resume => ({
            id:         resume._id,
            title:      resume.title,
            holder:     resume.owner,
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
    ): Promise<iface.ResumeDetailInterface> {

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
        if (user.user_type == UserType.EMPLOYER && resume.verifier != user.did) {
            throw new PermissionDeniedError();
        }

        if (user.user_type == UserType.EMPLOYEE && resume.owner != user.did) {
            throw new PermissionDeniedError();
        }

        // Get VC
        const vcs = (await this.ssiService.verifyVP(resume.careers.vp))
        .verifiablePresentation
        .verifiableCredential;

        // Serialize VCs
        const careers = vcs.map(vc => ({
            holder: vc.credentialSubject.id,
            issuer: vc.issuer.id,
            content: {
                from: vc.credentialSubject.from,
                to: vc.credentialSubject.to,
                where: vc.credentialSubject.where,
                what: vc.credentialSubject.what,
            },
            verify: vc.proof as iface.JWTProof,
            isVerified: true,
        } as iface.ResumeCareerEntryInterface));

        // Serialize SmartCareers
        for(const sc of resume.careers.smartCareers) {
            try {
                const career = (await sendIPFSGetRequest(sc)).data;
                careers.push({
                    holder:     career.holder,
                    issuer:     career.issuer,
                    content:    career.content,
                    verify:     { type: "IPFS_HASH", hash: sc },
                    isVerified: true,
                } as iface.ResumeCareerEntryInterface);
            } catch {
                careers.push({
                    verify:     { type: "IPFS_HASH", hash: sc },
                    isVerified: false,
                } as iface.ResumeCareerEntryInterface);
            }
        }

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

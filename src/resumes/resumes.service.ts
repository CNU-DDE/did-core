import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { sendBroccoliGetRequest } from 'src/utils/http.util';
import { PermissionDeniedError, ClientFaultError } from 'src/domain/errors.domain';
import { Resume } from './schema/resume.schema';
import { CreateResumeDto } from './dto/create-resume.dto';
import { CareerEntryDto } from './dto/post-resume.dto';
import { createVP } from 'src/utils/did.util';
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
}

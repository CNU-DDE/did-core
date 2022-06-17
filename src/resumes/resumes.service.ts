import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { sendBroccoliGetRequest } from '../httputils';
import { PermissionDeniedError, ClientFaultError } from 'src/errors';
import { Resume } from './schema/resume.schema';
import { CreateResumeDto } from './dto/create-resume.dto';
import { CareerEntryDto } from './dto/post-resume.dto';
import * as dts from 'did-core';
import Const from 'src/config/const.config';
import { createVP } from 'src/did';

@Injectable()
export class ResumesService {
    constructor(@InjectModel(Resume.name) private resumeModel: Model<Resume>) {}

    /**
     * Create claim
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
        positionId:     dts.positionId_t,
        coverLetterIds: dts.coverLetterId_t[],
        careerArr:      CareerEntryDto[],
    ) {
        // Validate holder
        const holderObj = (await sendBroccoliGetRequest("/user/self", accessToken))
        .data.user_info;

        if(holderObj.user_type != Const.EMPLOYEE_USER_TYPE) {
            // Client is not employee
            throw new PermissionDeniedError();
        } else if (holderObj.did != keystore.did) {
            // Wrong keystore
            throw new ClientFaultError();
        }

        // Validate verifier
        const verifierObj = (await sendBroccoliGetRequest("/user/" + verifier, accessToken))
        .data.user_info;

        if(verifierObj.user_type != Const.EMPLOYER_USER_TYPE) {
            // Wrong resume submission
            throw new ClientFaultError();
        }

        // Get VC array
        const vcs = careerArr
        .filter(career => career.careerType == Const.CAREER_TYPE_VC)
        .map(career => career.content);

        // Get SmartCareer array
        const smartCareers = careerArr
        .filter(career => career.careerType == Const.CAREER_TYPE_IPFS_HASH)
        .map(career => career.content);

        // Get VP and SmartCareers
        const careers = {
            vp: await createVP(holderObj.did, keystore.privKey, vcs),
            smartCareers,
        };

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
}

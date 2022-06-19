import * as dts from 'did-core';
import { ClaimContentInterface } from 'src/claims/dto/get-claim.iface';

export interface ResumeMinimumInterface {
    id:         dts.mongoId_t,
    holder:     dts.did_t,
    verifier:   dts.did_t,
    title:      string,
}

export interface ResumeCareerEntryInterface {
    holder:         dts.did_t;
    issuer:         dts.did_t;
    content:        ClaimContentInterface;
    isVerified:     boolean;
}

export interface ResumeDetailInterface {
    id:             dts.mongoId_t,
    owner:          dts.did_t,
    verifier:       dts.did_t,
    title:          string,
    positionId:     dts.mariaId_t,
    coverLetterIds: dts.mariaId_t[],
    contracts:      dts.ipfsHash_t[]
    resolvedVP:     ResumeCareerEntryInterface[],
}

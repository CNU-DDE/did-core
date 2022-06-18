import * as dts from 'did-core';
import { ClaimContentInterface } from 'src/claims/dto/get-claim.iface';

export interface ResumeMinimumInterface {
    id:         dts.mongoId_t,
    holder?:    dts.did_t,
    verifier?:  dts.did_t,
    title:      string,
}

export interface JWTProof {
    type:       "JwtProof2020";
    jwt:        dts.vcJwt_t;
}

export interface IPFSProof {
    type:       "IPFS_HASH",
    hash:       dts.ipfsHash_t,
}

export interface ResumeCareerEntryInterface {
    holder?:         dts.did_t;
    issuer?:         dts.did_t;
    content?:        ClaimContentInterface;
    verify:         JWTProof|IPFSProof;
    isVerified:     boolean;
}

export interface ResumeDetailInterface {
    id:             dts.mongoId_t,
    owner:          dts.did_t,
    verifier:       dts.did_t,
    title:          string,
    positionId:     dts.mariaId_t,
    coverLetterId:  dts.mariaId_t[],
    careers:        ResumeCareerEntryInterface[],
}

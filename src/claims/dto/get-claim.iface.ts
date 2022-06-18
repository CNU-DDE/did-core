import * as dts from 'did-core';
import { ClaimStatus, CareerType } from 'src/domain/enums.domain';

export interface ClaimContentInterface {
    from:   string;
    to:     string;
    where:  string;
    what:   string;
}

export interface ClaimMinimumInterface {
    id:         dts.mongoId_t,
    issuer?:    dts.did_t,
    holder?:    dts.did_t,
    title:      string,
    status?:    ClaimStatus,
}

export interface ClaimDetailInterface {
    id:             dts.mongoId_t,
    title:          string,
    claim:          ClaimContentInterface,
    issuer?:        dts.did_t,
    holder?:        dts.did_t,
    status?:        ClaimStatus,
    careerType?:    CareerType,
    career?:        dts.encVc_t|dts.ipfsHash_t,
}

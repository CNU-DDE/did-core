declare module 'did-core' {

    // -------------------------
    // Alias types
    // -------------------------
    // DID
    export type did_t           = string;
    export type vcJwt_t         = string;
    export type vpJwt_t         = string;
    export type address_t       = string;
    export type privKey_t       = string;
    export type pubKey_t        = string;
    // DB
    export type mongoId_t       = string;
    // HTTP
    export type accessToken_t   = string;
    // Career
    export type ipfsHash_t      = string;
    export type encVc_t         = string;
    export type career_t        = encVc_t|ipfsHash_t;
    // Resume
    export type mariaId_t       = number;
    export type positionId_t    = mariaId_t;
    export type coverLetterId_t = mariaId_t;

    // -------------------------
    // Literal types
    // -------------------------
    export type CLAIM_STATUS_PENDING_LITERAL    = 0;
    export type CLAIM_STATUS_ACCEPTED_LITERAL   = 1;
    export type CLAIM_STATUS_REJECTED_LITERAL   = 2;
    export type claimStatus_t =
        CLAIM_STATUS_PENDING_LITERAL |
        CLAIM_STATUS_ACCEPTED_LITERAL |
        CLAIM_STATUS_REJECTED_LITERAL;

    export type CAREER_TYPE_VC_LITERAL          = 0;
    export type CAREER_TYPE_IPFS_HASH_LITERAL   = 1;
    export type careerType_t =
        CAREER_TYPE_VC_LITERAL |
        CAREER_TYPE_IPFS_HASH_LITERAL;

    // -------------------------
    // Interfaces
    // -------------------------
    // SSI
    export interface KeystoreInterface {
        did:            did_t;
        walletAddress:  address_t;
        privKey:        privKey_t;
        pubKey:         pubKey_t;
    }

    export interface PostVerifiableCredentialRequestBody {
        holderDID:  did_t;
        claim:      claim_t;
        issuerDID:  did_t;
        issuerPriv: privKey_t;
    }

    export interface PostVerifiablePresentationRequestBody {
        holderDID:              did_t;
        holderPriv:             privKey_t;
        verifiableCredentials:  vcJwt_t[];
    }

    export interface PostVerifiedCredentialRequestBody {
        verifiableCredential:   vcJwt_t;
    }

    export interface PostVerifiedPresentationRequestBody {
        verifiablePresentation: vpJwt_t;
    }

    // Claim
    export interface ClaimContentInterface {
        from:   string;
        to:     string;
        where:  string;
        what:   string;
    }

    export interface ClaimMinimumInterface {
        id:         string,
        issuer?:    did_t,
        holder?:    did_t,
        title:      string,
        status?:    number,
    }

    export interface ClaimDetailInterface {
        id:         string,
        title:      string,
        claim:      ClaimContentInterface,
        issuer?:    did_t,
        holder?:    did_t,
        status?:    number,
        careerType?:number,
        career?:    vcJwt_t|ipfsHash_t,
    }

    // Resume
    export interface ResumeCareersInterface {
        vp:             vpJwt_t,
        smartCareers:   ipfsHash_t[],
    }
}

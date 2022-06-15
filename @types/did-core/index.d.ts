declare module 'did-core' {

    // -------------------------
    // Alias types
    // -------------------------
    export type did_t           = string;
    export type vcJwt_t         = string;
    export type vpJwt_t         = string;
    export type address_t       = string;
    export type privKey_t       = string;
    export type pubKey_t        = string;
    export type claim_t         = object;
    export type identifier_t    = string;
    export type ipfsHash_t      = string;

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
    export type career_t =
        CAREER_TYPE_VC_LITERAL |
        CAREER_TYPE_IPFS_HASH_LITERAL;

    // -------------------------
    // Interfaces
    // -------------------------
    export interface DIDInfo {
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

    export interface ClaimContentInterface {
        from:   string;
        to:     string;
        where:  string;
        what:   string;
    }

    interface UserMinimumInterface {
        did:            did_t,
        display_name:   string,
    }

    export interface ClaimMinimumInterface {
        id:         string,
        issuer?:    UserMinimumInterface,
        holder?:    UserMinimumInterface,
        title:      string,
        status?:    number,
    }

    interface UserDetailInterface {
        did:            did_t,
        display_name:   string,
        contact:        string,
        email:          string,
        address:        string,
        birth?:         string,
    }

    export interface ClaimDetailInterface {
        id:         string,
        title:      string,
        claim:      ClaimContentInterface,
        issuer?:    UserDetailInterface,
        holder?:    UserDetailInterface,
        status?:    number,
        careerType?:number,
        career?:    vcJwt_t|ipfsHash_t,
    }
}

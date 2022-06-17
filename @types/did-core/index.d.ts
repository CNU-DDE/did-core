declare module 'did-core' {
    // -------------------------
    // Types
    // -------------------------
    // Basic
    export type uri_t           = string;
    export type jwt_t           = string;
    export type hexadecimal_t   = string;
    export type sha256_t        = string;
    // DID
    export type did_t           = uri_t;
    export type vcJwt_t         = jwt_t;
    export type vpJwt_t         = jwt_t;
    export type address_t       = hexadecimal_t;
    export type privKey_t       = hexadecimal_t;
    export type pubKey_t        = hexadecimal_t;
    // DB
    export type mongoId_t       = string;
    export type mariaId_t       = number;
    // HTTP
    export type accessToken_t   = string;
    // Career
    export type ipfsHash_t      = sha256_t;
    export type encVc_t         = string;
    export type career_t        = encVc_t|ipfsHash_t;

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

    export interface ResumeMinimumInterface {
        id:         mongoId_t,
        holder?:    did_t,
        verifier?:  did_t,
        title:      string,
    }

    export interface JWTProof {
        type:       "JwtProof2020";
        jwt:        vcJwt_t;
    }

    export interface IPFSProof {
        type:       "IPFS_HASH",
        hash:       ipfsHash_t,
    }

    export interface ResumeCareerEntryInterface {
        holder:         did_t;
        verifier:       did_t;
        content:        ClaimContentInterface;
        verify:         JWTProof|IPFSProof;
        isVerified:     boolean;
    }

    export interface ResumeDetailInterface {
        id:             mongoId_t,
        owner:          did_t,
        verifier:       did_t,
        title:          string,
        positionId:     mariaId_t,
        coverLetterId:  mariaId_t[],
        careers:        ResumeCareerEntryInterface[],
    }
}

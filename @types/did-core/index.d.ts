declare module 'did-core' {
    // -------------------------
    // Types
    // -------------------------
    // Basic
    export type uri_t           = string;
    export type jwt_t           = string;
    export type hexadecimal_t   = string;
    export type sha256_t        = string;
    export type eciesCipher_t   = string;
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
    export type accessToken_t   = jwt_t;
    // Career
    export type ipfsHash_t      = sha256_t;
    export type encVc_t         = eciesCipher_t;
    export type career_t        = encVc_t|ipfsHash_t;
}

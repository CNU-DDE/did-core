declare module 'did-core' {
    export namespace typeManifest {
        type did_t = string;
        type vcJwt_t = string;
        type address_t = string;
        type privKey_t = string;
        type pubKey_t = string;
        type claim_t = object;

        interface DIDInfo {
            did: did_t;
            walletAddress: address_t;
            privKey: privKey_t;
            pubKey: pubKey_t;
        }
    }
}

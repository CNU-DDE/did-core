declare module 'did-core' {
    export namespace typeManifest {
        type did_t = string;
        type vcJwt_t = string;
        type vpJwt_t = string;
        type address_t = string;
        type privKey_t = string;
        type pubKey_t = string;
        type claim_t = object;
        type identifier_t = string;

        interface DIDInfo {
            did:            did_t;
            walletAddress:  address_t;
            privKey:        privKey_t;
            pubKey:         pubKey_t;
        }

        interface PostVCRequestBody {
            holderDID:  did_t;
            claim:      claim_t;
            issuerDID:  did_t;
            issuerPriv: privKey_t;
        }

        interface PostVPRequestBody {
            holderDID:              did_t;
            holderPriv:             privKey_t;
            verifiableCredentials:  vcJwt_t[];
        }
    }
}

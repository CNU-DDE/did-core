import { typeManifest as tm } from 'did-core';
import { EthrDID } from 'ethr-did';
import { Resolver, DIDDocument } from 'did-resolver'
import { getResolver } from 'ethr-did-resolver'
import {
    JwtCredentialPayload,
    JwtPresentationPayload,
    createVerifiableCredentialJwt,
    createVerifiablePresentationJwt,
    Issuer,
    verifyCredential,
    verifyPresentation,
    VerifiedCredential,
    VerifiedPresentation
} from 'did-jwt-vc'

const CHAIN = 'ropsten';

/**
 * Create New Etherium-Ropsten DID
 * @see Official Guide:     https://github.com/uport-project/ethr-did/blob/master/docs/guides/index.md#create-ethr-did-from-scratch
 * @see EthrDID contructor: https://github.com/uport-project/ethr-did/blob/e76a8e040bb5a1386c9b0488a147717d283b1cea/src/index.ts#L21
 * @see createKeyPair:      https://github.com/uport-project/ethr-did/blob/e76a8e040bb5a1386c9b0488a147717d283b1cea/src/index.ts#L100
 * @see EthDID class:       https://github.com/uport-project/ethr-did/blob/e76a8e040bb5a1386c9b0488a147717d283b1cea/src/index.ts#L50
 * @return  DIDInfo     Generated DID, wallet address, private key, and public key
 */
export function createNewEthDID(): tm.DIDInfo {
    const keypair = EthrDID.createKeyPair();
    const chainNameOrId = CHAIN;
    const ethrDid = new EthrDID({...keypair, chainNameOrId});

    return {
        did: ethrDid.did,
        walletAddress: keypair.address,
        privKey: keypair.privateKey,
        pubKey: keypair.publicKey
    } as tm.DIDInfo;
}

/**
 * Get resolver object with infura provider
 * @see https://github.com/decentralized-identity/did-jwt-vc#prerequisites-1
 * @param chainName string  Optional parameter for chain name (default: ropsten)
 * @return Resolver
 */
export function getInfuraResolver(chainName?: string): Resolver {
    // Get Infura.io project ID
    const infuraProjectID = process.env.INFURA_PID;
    if(!infuraProjectID) {
        console.warn("[error] Infura project ID not set")
        console.warn("[error] * do: 'export INFURA_PID=${Infura_project_ID_here}'")
        throw new Error("Cannot import Infura project ID");
    }

    // Get resolver
    const name = chainName || CHAIN;
    const rpcUrl = `https://${name}.infura.io/v3/${infuraProjectID}`;
    return new Resolver(getResolver({ name, rpcUrl }));
}

/**
 * Resolve DID to DID Document
 * @see Official guide: https://github.com/uport-project/ethr-did/blob/master/docs/guides/index.md#resolving-the-did-document
 * @param   identity    identifier_t    DID method-specific identifier
 * @return  Promise<DIDDocument|null>   Return resolved DID document or null when the DID document is not found
 */
export async function resolveDID(identity: tm.identifier_t): Promise<DIDDocument> {

    const did = `did:ethr:${CHAIN}:${identity}`;
    const didResolver = getInfuraResolver();
    // Resolve
    const didDoc = (await didResolver.resolve(did)).didDocument;

    if(!didDoc) {
        throw new Error('Cannot resolve DID');
    }

    return didDoc;
}

/**
 * Create VC for holder by issuer
 * @see https://github.com/decentralized-identity/did-jwt-vc#creating-a-verifiable-credential
 * @param holderDID     did_t   DID for VC holder
 * @param claim         claim_t Claim for VC holder
 * @param issuerDID     did_t   DID for VC issuer
 * @param issuerPrivkey did_t   Private key for VC issuer
 */
export async function createVC(
    holderDID: tm.did_t,
    claim: tm.claim_t,
    issuerDID: tm.did_t,
    issuerPrivkey: tm.did_t): Promise<tm.vcJwt_t> {

    // Create EthDID obj for issuer
    const issuer = new EthrDID({
      identifier: issuerDID,
      privateKey: issuerPrivkey
    }) as Issuer;

    // Create payload for JWT
    const vcPayload: JwtCredentialPayload = {
      sub: holderDID,
      nbf: 1562950282, // TODO: wft is nbf
      vc: {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential'],
        credentialSubject: claim
      }
    }
    return await createVerifiableCredentialJwt(vcPayload, issuer)
}

export async function verifyVC(vcJwt: tm.vcJwt_t): Promise<VerifiedCredential> {
    return await verifyCredential(vcJwt, getInfuraResolver())
        .catch((err) => {
            console.warn(err);
            throw new Error('Cannot verify VC');
        });
}

/**
 * Create VP for holder
 * @see https://github.com/decentralized-identity/did-jwt-vc#creating-a-verifiable-presentation
 * @param holderDID     did_t       DID for VP holder
 * @param holderPrivKey privKey_t   Private key for VP holder
 * @param vcs           []vcJwt_t   Verifiable Credentials
 * @return  Promise<vpJwt_t>        Created Verifiable Presentation
 */
export async function createVP(
    holderDID: tm.did_t,
    holderPrivKey: tm.privKey_t,
    vcs: Array<tm.vcJwt_t>
    ): Promise<tm.vpJwt_t> {

    // Create EthDID obj for holder
    const holder = new EthrDID({
      identifier: holderDID,
      privateKey: holderPrivKey
    }) as Issuer;

    // Create VP payload
    const vpPayload: JwtPresentationPayload = {
      vp: {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiablePresentation'],
        verifiableCredential: vcs
      }
    };

    return await createVerifiablePresentationJwt(vpPayload, holder);
}

export async function verifyVP(vpJwt: tm.vpJwt_t): Promise<VerifiedPresentation> {
    return await verifyPresentation(vpJwt, getInfuraResolver())
        .catch((err) => {
            console.warn(err);
            throw new Error('Cannot verify VP');
        });
}

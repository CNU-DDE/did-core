import * as types from 'did-core';
import * as errors from './errors';
import { EthrDID } from 'ethr-did';
import { Resolver, DIDDocument } from 'did-resolver'
import { getResolver } from 'ethr-did-resolver'
import Env from './config/env.config';
import Const from './config/const.config';
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

/**
 * Create New Etherium-Ropsten DID
 * @see Official Guide:     https://github.com/uport-project/ethr-did/blob/master/docs/guides/index.md#create-ethr-did-from-scratch
 * @see EthrDID contructor: https://github.com/uport-project/ethr-did/blob/e76a8e040bb5a1386c9b0488a147717d283b1cea/src/index.ts#L21
 * @see createKeyPair:      https://github.com/uport-project/ethr-did/blob/e76a8e040bb5a1386c9b0488a147717d283b1cea/src/index.ts#L100
 * @see EthDID class:       https://github.com/uport-project/ethr-did/blob/e76a8e040bb5a1386c9b0488a147717d283b1cea/src/index.ts#L50
 * @return  DIDInfo     Generated DID, wallet address, private key, and public key
 */
export function createNewEthDID(): types.DIDInfo {
    const keypair = EthrDID.createKeyPair();
    const chainNameOrId = Const.DEFAULT_CHAIN;
    const ethrDid = new EthrDID({...keypair, chainNameOrId});

    return {
        did: ethrDid.did,
        walletAddress: keypair.address,
        privKey: keypair.privateKey,
        pubKey: keypair.publicKey
    };
}

/**
 * Get resolver object with infura provider
 * @see https://github.com/decentralized-identity/did-jwt-vc#prerequisites-1
 * @param chainName string  Optional parameter for chain name (default: ropsten)
 * @return Resolver
 */
export function getInfuraResolver(chainName?: string): Resolver {
    const name = chainName || Const.DEFAULT_CHAIN;
    const rpcUrl = `https://${name}.infura.io/v3/${Env.get('did.infuraPid')}`;
    return new Resolver(getResolver({ name, rpcUrl }));
}

/**
 * Resolve DID to DID Document
 * @see Official guide: https://github.com/uport-project/ethr-did/blob/master/docs/guides/index.md#resolving-the-did-document
 * @param   did         did_t           DID method-specific identifier
 * @return  Promise<DIDDocument|null>   Return resolved DID document or null when the DID document is not found
 */
export async function resolveDID(did: types.did_t): Promise<DIDDocument> {
    // Get network type
    const parsed = (did as string).split(':');
    const networkType = parsed.length == 4
        ? parsed[2]     // Testnet
        : 'mainnet';    // Mainnet

    // Resolve
    const didDoc = (await getInfuraResolver(networkType).resolve(did)).didDocument;

    if(!didDoc) {
        throw new errors.ResolveDIDFailureError();
    }

    return didDoc;
}

/**
 * Create VC for holder by issuer
 * @see https://github.com/decentralized-identity/did-jwt-vc#creating-a-verifiable-credential
 * @param holderDID     did_t       DID for VC holder
 * @param claim         claim_t     Claim for VC holder
 * @param issuerDID     did_t       DID for VC issuer
 * @param issuerPrivkey privKey_t   Private key for VC issuer
 */
export async function createVC(
    holderDID:      types.did_t,
    claim:          types.claim_t,
    issuerDID:      types.did_t,
    issuerPrivkey:  types.privKey_t,
): Promise<types.vcJwt_t> {

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
    };
    return await createVerifiableCredentialJwt(vcPayload, issuer);
}

/**
 * Verify VerifiableCredential issued by Issuer
 * @see Official guide: https://github.com/decentralized-identity/did-jwt-vc#verifying-a-verifiable-credential
 * @param   vcJwt   vcJwt_t     VerifiableCredential JWT
 * @return  Promise<VerifiedCredential>
 */
export async function verifyVC(vcJwt: types.vcJwt_t): Promise<VerifiedCredential> {
    return await verifyCredential(vcJwt, getInfuraResolver())
    .catch((err) => {
        console.warn(err);
        throw new errors.VerifyVCFailureError();
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
    holderDID: types.did_t,
    holderPrivKey: types.privKey_t,
    vcs: Array<types.vcJwt_t>
    ): Promise<types.vpJwt_t> {

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

/**
 * Verify VerifiablePresentation generated by Holder
 * @see Official guide: https://github.com/decentralized-identity/did-jwt-vc#verifying-a-verifiable-presentation
 * @param   vpJwt   vpJwt_t     VerifiablePresentation JWT
 * @return  Promise<VerifiedPresentation>
 */
export async function verifyVP(vpJwt: types.vpJwt_t): Promise<VerifiedPresentation> {
    return await verifyPresentation(vpJwt, getInfuraResolver())
    .catch((err) => {
        console.warn(err);
        throw new errors.VerifyVPFailureError();
    });
}

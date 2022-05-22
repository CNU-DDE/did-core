import { typeManifest as tm } from 'did-core';
import { EthrDID } from 'ethr-did';
import { Resolver, DIDDocument } from 'did-resolver'
import { getResolver } from 'ethr-did-resolver'
import {
    JwtCredentialPayload,
    JwtPresentationPayload,
    createVerifiableCredentialJwt,
    createVerifiablePresentationJwt,
    Issuer
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
 * Resolve DID to DID Document
 * @see Official guide: https://github.com/uport-project/ethr-did/blob/master/docs/guides/index.md#resolving-the-did-document
 * @param   identity    identifier_t    DID method-specific identifier
 * @return  Promise<DIDDocument|null>   Return resolved DID document or null when the DID document is not found
 */
export async function resolveDID(identity: tm.identifier_t): Promise<DIDDocument|null> {

    // Get Infura.io project ID
    const infuraProjectID = process.env.INFURA_PID;
    if(!infuraProjectID) {
        console.error("[error] Infura project ID not set")
        console.error("[error] * do: 'export INFURA_PID=${Infura_project_ID_here}'")
        return null;
    }

    // Get resolver
    const did = `did:ethr:${CHAIN}:${identity}`;
    const rpcUrl = "https://ropsten.infura.io/v3/" + infuraProjectID;
    const didResolver = new Resolver(getResolver({ rpcUrl, name: CHAIN }));

    // Resolve
    return (await didResolver.resolve(did)).didDocument;
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

// DID resolving test
// (async () => {
//   console.log(await resolveDID('did:ethr:ropsten:0x031ef767936996de95f5be7b36fada08d070b97e85d874ce23e5f9fcbdf7149aa2'));
// })();

(async () => {
  console.log(await createVC(
      'did:ethr:0x435df3eda57154cf8cf7926079881f2912f54db4',
      {
          degree: {
            type: 'BachelorDegree',
            name: 'CSE'
          }
      },
      '0xf1232f840f3ad7d23fcdaa84d6c66dac24efb198',
      'd8b595680851765f38ea5405129244ba3cbad84467d190859f4c8b20c1ff6c75'
  ));
})();

const testVC = "eyJhbGciOiJFUzI1NkstUiIsInR5cCI6IkpXVCJ9.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7ImRlZ3JlZSI6eyJ0eXBlIjoiQmFjaGVsb3JEZWdyZWUiLCJuYW1lIjoiQ1NFIn19fSwic3ViIjoiZGlkOmV0aHI6MHg0MzVkZjNlZGE1NzE1NGNmOGNmNzkyNjA3OTg4MWYyOTEyZjU0ZGI0IiwibmJmIjoxNTYyOTUwMjgyLCJpc3MiOiJkaWQ6ZXRocjoweEYxMjMyRjg0MGYzYUQ3ZDIzRmNEYUE4NGQ2QzY2ZGFjMjRFRmIxOTgifQ.La-maDcP8NXaucFDwSK-rD4DYmcIvBCQa4CA3q-05bCzdHHf6ZSdHQWMJuwn34vIMAl6tBCS992QKrWwEZT5QQA";

(async () => {
  console.log(await createVP(
      '0xf1232f840f3ad7d23fcdaa84d6c66dac24efb198',
      'd8b595680851765f38ea5405129244ba3cbad84467d190859f4c8b20c1ff6c75',
      [ testVC ]
  ));
})();

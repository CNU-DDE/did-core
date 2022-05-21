import { typeManifest as tm } from 'did-core';
import { EthrDID } from 'ethr-did';
import { Resolver, DIDDocument } from 'did-resolver'
import { getResolver } from 'ethr-did-resolver'
import { JwtCredentialPayload, createVerifiableCredentialJwt, Issuer } from 'did-jwt-vc'

export function createNewEthDID(): tm.DIDInfo {
    const keypair = EthrDID.createKeyPair();
    const chainNameOrId = 'ropsten';
    const ethrDid = new EthrDID({...keypair, chainNameOrId});

    return {
        did: ethrDid.did,
        walletAddress: keypair.address,
        privKey: keypair.privateKey,
        pubKey: keypair.publicKey
    } as tm.DIDInfo;
}

export async function resolveDID(did: tm.did_t): Promise<DIDDocument|null> {
    const infuraProjectID = process.env.INFURA_PID;
    if(!infuraProjectID) {
        console.error("[error] Infura project ID not set")
        console.error("[error] * do: 'export INFURA_PID=${Infura_project_ID_here}'")
        return null;
    }

    const rpcUrl = "https://ropsten.infura.io/v3/" + infuraProjectID;
    const didResolver = new Resolver(getResolver({ rpcUrl, name: "ropsten" }));

    return (await didResolver.resolve(did)).didDocument;
}

/**
 * Create VC for holder by issuer
 * @see https://github.com/decentralized-identity/did-jwt-vc#creating-jwts
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

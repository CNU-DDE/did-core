import { Injectable } from '@nestjs/common';
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
import * as errors from 'src/domain/errors.domain';
import * as dts from 'did-core';
import { ClaimContentDto } from 'src/claims/dto/nested/claim-content.dto';
import {KeystoreDto} from './dto/keystore.dto';
import Const from 'src/config/const.config';
import Env from 'src/config/env.config';

@Injectable()
export class SsiService {
    /**
     * Create New Etherium-Ropsten DID
     * @see Official Guide:     https://github.com/uport-project/ethr-did/blob/master/docs/guides/index.md#create-ethr-did-from-scratch
     * @see EthrDID contructor: https://github.com/uport-project/ethr-did/blob/e76a8e040bb5a1386c9b0488a147717d283b1cea/src/index.ts#L21
     * @see createKeyPair:      https://github.com/uport-project/ethr-did/blob/e76a8e040bb5a1386c9b0488a147717d283b1cea/src/index.ts#L100
     * @see EthDID class:       https://github.com/uport-project/ethr-did/blob/e76a8e040bb5a1386c9b0488a147717d283b1cea/src/index.ts#L50
     * @return  DIDInfo     Generated DID, wallet address, private key, and public key
     */
    createNewEthDID(): KeystoreDto {
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
    getInfuraResolver(chainName?: string): Resolver {
        // Get resolver
        const name = chainName || Const.DEFAULT_CHAIN;
        const rpcUrl = `https://${name}.infura.io/v3/${Env.get('did.infuraPid')}`;
        return new Resolver(getResolver({ name, rpcUrl }));
    }

    /**
     * Resolve DID to DID Document
     * @see Official guide: https://github.com/uport-project/ethr-did/blob/master/docs/guides/index.md#resolving-the-did-document
     * @param   did did_t           DID method-specific identifier
     * @return  Promise<DIDDocument|null>   Return resolved DID document or null when the DID document is not found
     */
    async resolveDID(did: dts.did_t): Promise<DIDDocument> {
        // Get network type
        const parsed = (did as string).split(':');
        const networkType = parsed.length == 4
            ? parsed[2]     // Testnet
            : 'mainnet';    // Mainnet

        // Resolve
        const didDoc = (await this.getInfuraResolver(networkType).resolve(did)).didDocument;

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
    async createVC(
        holderDID:      dts.did_t,
        claim:          ClaimContentDto,
        issuerDID:      dts.did_t,
        issuerPrivkey:  dts.privKey_t): Promise<dts.vcJwt_t> {

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
     * Verify VerifiableCredential issued by Issuer
     * @see Official guide: https://github.com/decentralized-identity/did-jwt-vc#verifying-a-verifiable-credential
     * @param   vcJwt   vcJwt_t     VerifiableCredential JWT
     * @return  Promise<VerifiedCredential>
     */
    async verifyVC(vcJwt: dts.vcJwt_t): Promise<VerifiedCredential> {
        return await verifyCredential(vcJwt, this.getInfuraResolver())
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
    async createVP(
        holderDID:      dts.did_t,
        holderPrivKey:  dts.privKey_t,
        vcs:            Array<dts.vcJwt_t>
        ): Promise<dts.vpJwt_t> {

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
    async verifyVP(vpJwt: dts.vpJwt_t): Promise<VerifiedPresentation> {
        return await verifyPresentation(vpJwt, this.getInfuraResolver())
        .catch((err) => {
            console.warn(err);
            throw new errors.VerifyVPFailureError();
        });
    }
}

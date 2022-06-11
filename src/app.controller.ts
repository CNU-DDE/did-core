import { AppService } from './app.service';
import { Response } from 'express';
import { typeManifest as tm } from 'did-core';
import * as errors from './app.errors';
import {
    Controller,
    Get,
    Res,
    Param,
    Post,
    Body,
} from '@nestjs/common';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    /**
     * [GET] /ssi/did
     * @pathVariable    nil
     * @queryString     nil
     * @reqBody         nil
     * @response        { error: ErrorMessage, content: GeneratedDID }
     */
    @Get('/ssi/did')
    getDID(
        @Res()  res:    Response,
    ) {

        try {
            res.send(JSON.stringify({
                error: null,
                content: this.appService.createNewEthDID(),
            }));
        } catch(err) {
            const wrapped = new errors.UnhandledError(err as Error);
            res.status(wrapped.httpStatusCode)
            .send(JSON.stringify({
                error: wrapped.message,
                content: null,
            }));
        }
    }

    /**
     * [GET] /ssi/did-document/:did
     * @pathVariable    :did    DID URI
     * @queryString     nil
     * @reqBody         nil
     * @response        { error: ErrorMessage, content: ResolvedDIDDocument }
     */
    @Get('/ssi/did-document/:did')
    getDIDDoc(
        @Res()          res:    Response,
        @Param('did')   did:    string,
    ) {
        this.appService.resolveDID(did)
        .then(doc => {
            res.send(JSON.stringify({
                error: null,
                content: doc,
            }));
        }).catch((err: Error) => {
            if(err instanceof errors.InfuraProjectIdImportFailureError) {
                res.status(err.httpStatusCode)
                .send(JSON.stringify({
                    error: err.message,
                    content: null,
                }));
            } else {
                const wrapped = new errors.UnhandledError(err);
                res.status(wrapped.httpStatusCode)
                .send(JSON.stringify({
                    error: wrapped.message,
                    content: null,
                }));
            }
        });
    }

    /**
     * [POST] /ssi/verifiable-credential
     * @pathVariable    nil
     * @queryString     nil
     * @reqBody         { holderDID: string, claim: object, issuerDID: string, issuerPriv: string }
     * @response        { error: ErrorMessage, content: GeneratedVC }
     */
    @Post('/ssi/verifiable-credential')
    postVerifiableCredential(
        @Body() b:   tm.PostVerifiableCredentialRequestBody,
        @Res()  res:    Response
    ) {

        this.appService.createVC(b.holderDID, b.claim, b.issuerDID, b.issuerPriv)
        .then((vc) => {
            res.send(JSON.stringify({
                error: null,
                content: vc,
            }));
        }).catch((err: Error) => {
            const wrapped = new errors.UnhandledError(err);
            res.status(wrapped.httpStatusCode)
            .send(JSON.stringify({
                error: wrapped.message,
                content: null,
            }));
        });
    }

    /**
     * [POST] /ssi/verifiable-presentation
     * @pathVariable    nil
     * @queryString     nil
     * @reqBody         { holderDID: string, holderPriv: string, verifiableCredentials: []string }
     * @response        { error: ErrorMessage, content: VerifiedVC }
     */
    @Post('/ssi/verifiable-presentation')
    postVerfiablePresentation(
        @Res()  res:    Response,
        @Body() b:      tm.PostVerifiablePresentationRequestBody,
    ) {
        this.appService.createVP(b.holderDID, b.holderPriv, b.verifiableCredentials)
        .then((vp) => {
            res.send(JSON.stringify({
                error: null,
                content: vp,
            }));
        }).catch((err: Error) => {
            const wrapped = new errors.UnhandledError(err);
            res.status(wrapped.httpStatusCode)
            .send(JSON.stringify({
                error: wrapped.message,
                content: null,
            }));
        });
    }

    /**
     * [POST] /ssi/verified-credential
     * @pathVariable    nil
     * @queryString     nil
     * @reqBody         { verifiableCredential: string }
     * @response        { error: ErrorMessage, content: VerifiedVC }
     */
    @Post('/ssi/verified-credential')
    postVerifiedCredential(
        @Res()  res:    Response,
        @Body() b:      tm.PostVerifiedCredentialRequestBody,
    ) {
        this.appService.verifyVC(b.verifiableCredential)
        .then((vc) => {
            res.send(JSON.stringify({
                error: null,
                content: vc,
            }));
        }).catch((err: Error) => {
            if(err instanceof errors.VerifyVCFailureError) {
                res.status(err.httpStatusCode)
                .send(JSON.stringify({
                    error: err.message,
                    content: null,
                }));
            } else {
                const wrapped = new errors.UnhandledError(err);
                res.status(wrapped.httpStatusCode)
                .send(JSON.stringify({
                    error: wrapped.message,
                    content: null,
                }));
            }
        });
    }

    /**
     * [POST] /ssi/verified-presentation
     * @pathVariable    nil
     * @queryString     nil
     * @reqBody         { verifiablePresentation: string }
     * @response        { error: ErrorMessage, content: VerifiedVP }
     */
    @Post('/ssi/verified-presentation')
    postVerifiedPresentation(
        @Res()  res:    Response,
        @Body() b:      tm.PostVerifiedPresentationRequestBody
    ) {
        this.appService.verifyVP(b.verifiablePresentation)
        .then((vp) => {
            res.send(JSON.stringify({
                error: null,
                content: vp,
            }));
        }).catch((err: Error) => {
            if(err instanceof errors.VerifyVPFailureError) {
                res.status(err.httpStatusCode)
                .send(JSON.stringify({
                    error: err.message,
                    content: null,
                }));
            } else {
                const wrapped = new errors.UnhandledError(err);
                res.status(wrapped.httpStatusCode)
                .send(JSON.stringify({
                    error: wrapped.message,
                    content: null,
                }));
            }
        });
    }
}

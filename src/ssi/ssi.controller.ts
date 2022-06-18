import {
    Controller,
    Get,
    Res,
    Param,
    Post,
    Body,
} from '@nestjs/common';
import { Response } from 'express';
import { SsiService } from './ssi.service';
import * as errors from 'src/domain/errors.domain';
import * as dto from './dto/post-req.dto';

@Controller('ssi')
export class SsiController {
    constructor(private readonly ssiService: SsiService) {}

    /**
     * [GET] /ssi/did
     * @pathVariable    nil
     * @queryString     nil
     * @reqBody         nil
     * @response        { error: ErrorMessage, content: GeneratedDID }
     */
    @Get('/did')
    getDID(
        @Res()  res:    Response,
    ) {

        try {
            res.send(JSON.stringify({
                error: null,
                content: this.ssiService.createNewEthDID(),
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
    @Get('/did-document/:did')
    getDIDDoc(
        @Res()          res:    Response,
        @Param('did')   did:    string,
    ) {
        this.ssiService.resolveDID(did)
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
    @Post('/verifiable-credential')
    postVerifiableCredential(
        @Body() body:   dto.PostVerifiableCredentialDto,
        @Res()  res:    Response
    ) {

        this.ssiService.createVC(
            body.holderDID,
            body.claim,
            body.issuerDID,
            body.issuerPriv,
        ).then((vc) => {
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
    @Post('/verifiable-presentation')
    postVerfiablePresentation(
        @Res()  res:    Response,
        @Body() body:   dto.PostVerifiablePresentationDto,
    ) {
        this.ssiService.createVP(
            body.holderDID,
            body.holderPriv,
            body.verifiableCredentials
        ).then((vp) => {
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
    @Post('/verified-credential')
    postVerifiedCredential(
        @Res()  res:    Response,
        @Body() body:   dto.PostVerifiedCredentialDto,
    ) {
        this.ssiService.verifyVC(body.verifiableCredential)
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
    @Post('/verified-presentation')
    postVerifiedPresentation(
        @Res()  res:    Response,
        @Body() body:   dto.PostVerifiedPresentationDto,
    ) {
        this.ssiService.verifyVP(body.verifiablePresentation)
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

import express from 'express';
import cors from 'cors';
import logger from 'morgan';
import * as service from './service';
import * as errors from './errors';
import { typeManifest as tm } from 'did-core';

// Constants
const app = express();
const port = 7771;
const options = {
    origin: '*',
    credentials: true,
    optionsSuccessStatus: 200
};

// Middleware setup
app.use(cors(options));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(logger('dev'));

// Routes
/**
 * [GET] /ssi/did
 * @param pathVariable  nil
 * @param queryString   nil
 * @param reqBody       nil
 * @return { error: ErrorMessage, content: GeneratedDID }
 */
app.get('/ssi/did', (req, res) => {
    // Ignore unused
    const {} = req;

    try {
        res.send(JSON.stringify({
            error: null,
            content: service.createNewEthDID(),
        }));
    } catch(err) {
        const wrapped = new errors.UnhandledError(err as Error);
        res.status(wrapped.httpStatusCode)
        .send(JSON.stringify({
            error: wrapped.message,
            content: null,
        }));
    }
});

/**
 * [GET] /ssi/did-document/:did
 * @param pathVariable  :did    DID URI
 * @param queryString   nil
 * @param reqBody       nil
 * @return { error: ErrorMessage, content: ResolvedDIDDocument }
 */
app.get('/ssi/did-document/:did', (req, res) => {
    service.resolveDID(req.params.did)
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
});

/**
 * [POST] /ssi/verifiable-credential
 * @param pathVariable  nil
 * @param queryString   nil
 * @param reqBody       { holderDID: string, claim: object, issuerDID: string, issuerPriv: string }
 * @return { error: ErrorMessage, content: GeneratedVC }
 */
app.post('/ssi/verifiable-credential', (req, res) => {
    const {
        holderDID,
        claim,
        issuerDID,
        issuerPriv,
    } = req.body as tm.PostVerifiableCredentialRequestBody;
    service.createVC(holderDID, claim, issuerDID, issuerPriv)
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
});

app.post('/ssi/verifiable-presentation', (req, res) => {
    const {
        holderDID,
        holderPriv,
        verifiableCredentials,
    } = req.body as tm.PostVerifiablePresentationRequestBody;
    service.createVP(holderDID, holderPriv, verifiableCredentials)
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
});

app.post('/ssi/verified-credential', (req, res) => {
    const {
        verifiableCredential,
    } = req.body as tm.PostVerifiedCredentialRequestBody;
    service.verifyVC(verifiableCredential)
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
});

app.post('/ssi/verified-presentation', (req, res) => {
    const {
        verifiablePresentation,
    } = req.body as tm.PostVerifiedPresentationRequestBody;
    service.verifyVP(verifiablePresentation)
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
});

// Start server
app.listen(port, () => {
    console.log(`[${new Date()}] Server listens on 0.0.0.0:${port}`);
});

import {
    StatusCodes,
    getReasonPhrase,
} from 'http-status-codes';

export class BaseError extends Error {
    httpStatusCode: number;
    httpStatusMessage: string;

    constructor(code: number, errMsg: string) {
        super(errMsg)
        this.httpStatusCode = code;
        this.httpStatusMessage = getReasonPhrase(code);
    }

    compareErrorWith(err: Error): boolean {
        return this.message === err.message;
    }
}

export class InfuraProjectIdImportFailureError extends BaseError {
    constructor() {
        super(StatusCodes.INTERNAL_SERVER_ERROR, 'Cannot import Infura project ID');
    }
}

export class ResolveDIDFailureError extends BaseError {
    constructor() {
        super(StatusCodes.BAD_REQUEST, 'Cannot resolve DID');
    }
}

export class VerifyVCFailureError extends BaseError {
    constructor() {
        super(StatusCodes.BAD_REQUEST, 'Cannot verify VC');
    }
}

export class VerifyVPFailureError extends BaseError {
    constructor() {
        super(StatusCodes.BAD_REQUEST, 'Cannot verify VP');
    }
}

export class PermissionDeniedError extends BaseError {
    constructor() {
        super(StatusCodes.BAD_REQUEST, 'Permission denied');
    }
}

export class UnhandledError extends BaseError {
    constructor(err: Error) {
        super(StatusCodes.INTERNAL_SERVER_ERROR, err.message);
    }
}

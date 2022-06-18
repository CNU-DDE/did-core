import { Response } from 'express';
import { BaseError, UnhandledError } from 'src/domain/errors.domain';
import { AxiosError } from 'axios';

export function errorHandlerCallback(res: Response) {
    return (err: Error) => {
        // Handled error
        if(err instanceof BaseError) {
            res.status(err.httpStatusCode).send({ error: err.message });

        // Microservice error
        } else if(err instanceof AxiosError) {
            res.status(err.response.status).send(err.response.data);

        // Unhandled error
        } else {
            const wrapped = new UnhandledError(err);
            res.status(wrapped.httpStatusCode).send({ error: err.message });
        }
    }
}

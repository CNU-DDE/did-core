import {
    Controller,
    Post,
    Body,
    Req,
    Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ClaimsService } from './claims.service';
import { PostClaimDto } from './dto/post-claim.dto';
import { BaseError, UnhandledError } from 'src/errors';
import { AxiosError } from 'axios';

@Controller('claims')
export class ClaimsController {
    constructor(private readonly claimsService: ClaimsService) {}

    @Post()
    async create(
        @Req()  req:        Request,
        @Res()  res:        Response,
        @Body() claimsData: PostClaimDto,
    ) {
        this.claimsService.create(claimsData, req.cookies.access_token)
        .then(() => {
            res.status(201).send({ error: null });
        })
        .catch(err => {
            // Handled error
            if(err instanceof BaseError) {
                res.status(err.httpStatusCode).send({ error: err.message });

            // Microservice error
            } else if(err instanceof AxiosError) {
                res.status(err.response.status).send(err.response.data);

            // Unhandled error
            } else {
                throw new UnhandledError(err);
            }
        })
        .catch(err => {
            res.status(err.httpStatusCode).send({ error: err.message });
        });
    }
}

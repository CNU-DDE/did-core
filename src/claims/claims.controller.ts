import {
    Controller,
    Param,
    Post,
    Body,
    Req,
    Res,
    Get,
    Patch,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ClaimsService } from './claims.service';
import { PostDto } from './dto/http/post-claim.dto';
import { PatchClaimDto } from './dto/http/patch-claim.dto';
import { BaseError, UnhandledError } from 'src/errors';
import { AxiosError } from 'axios';
import { StatusCodes as http } from 'http-status-codes';
import Const from 'src/config/const.config';

@Controller(`api/${Const.API_VERSION}/claim`)
export class ClaimsController {
    constructor(private readonly claimsService: ClaimsService) {}

    @Post()
    async create(
        @Req()  req:        Request,
        @Res()  res:        Response,
        @Body() claimsData: PostDto,
    ) {
        this.claimsService.create(
            req.cookies.access_token,
            claimsData,
        ).then(() => {
            res.status(http.CREATED).send({ error: null });
        }).catch(err => {
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

    @Get()
    async getAll(
        @Req()  req:        Request,
        @Res()  res:        Response,
    ) {
        this.claimsService.getAll(req.cookies.access_token)
        .then(claims => {
            res.status(http.OK).send({ error: null, claims, });
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

    @Get('/:id')
    async getOne(
        @Req()          req:    Request,
        @Res()          res:    Response,
        @Param('id')    id:     string,
    ) {
        this.claimsService.getOne(id, req.cookies.access_token)
        .then(detail => {
            res.status(http.OK).send({ error: null, detail, });
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

    @Patch(':id')
    async update(
        @Req()          req:    Request,
        @Res()          res:    Response,
        @Param('id')    id:     string,
        @Body()         body:   PatchClaimDto,
    ) {
        this.claimsService.updateVC(
            id,
            body.status,
            body.keystore,
            req.cookies.access_token,
        ).then(() => {
            res.status(http.OK).send({ error: null });
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

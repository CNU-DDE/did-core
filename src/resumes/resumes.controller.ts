import {
    Controller,
    Post,
    Param,
    Get,
    Body,
    Req,
    Res,
    Query,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseError, UnhandledError } from 'src/domain/errors.domain';
import { ResumesService } from './resumes.service';
import { PostResumeDto } from './dto/post-resume.dto';
import { AxiosError } from 'axios';
import { StatusCodes as http } from 'http-status-codes';
import { mariaId_t, mongoId_t } from 'did-core';
import Const from 'src/config/const.config';

@Controller(`api/${Const.API_VERSION}/resume`)
export class ResumesController {
    constructor(private readonly resumesService: ResumesService) {}

    @Post()
    async create(
        @Req()  req:        Request,
        @Res()  res:        Response,
        @Body() claimsData: PostResumeDto,
    ) {
        this.resumesService.create(
            req.cookies.access_token,
            claimsData.keystore,
            claimsData.verifier,
            claimsData.title,
            claimsData.positionId,
            claimsData.coverLetterIds,
            claimsData.careers,
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
        @Req()              req:        Request,
        @Res()              res:        Response,
        @Query('position')  positionId: mariaId_t,
    ) {
        this.resumesService.getAll(req.cookies.access_token, positionId)
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
        @Param('id')    id:     mongoId_t,
    ) {
        this.resumesService.getOne(id, req.cookies.access_token)
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
}

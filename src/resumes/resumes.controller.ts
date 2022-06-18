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
import { ResumesService } from './resumes.service';
import { PostResumeDto } from './dto/post-resume.dto';
import { StatusCodes as http } from 'http-status-codes';
import { mariaId_t, mongoId_t } from 'did-core';
import Const from 'src/config/const.config';
import {errorHandlerCallback} from 'src/utils/callback.util';

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
        }).catch(errorHandlerCallback(res));
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
        }).catch(errorHandlerCallback(res));
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
        }).catch(errorHandlerCallback(res));
    }
}

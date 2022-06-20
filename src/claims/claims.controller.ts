import {
    Controller,
    Param,
    Query,
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
import { StatusCodes as http } from 'http-status-codes';
import { errorHandlerCallback } from 'src/utils/callback.util';
import Const from 'src/config/const.config';
import {career_t} from 'did-core';

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
        }).catch(errorHandlerCallback(res));
    }

    @Get()
    async getAll(
        @Req()          req:        Request,
        @Res()          res:        Response,
        @Query('type')  careerType: career_t,
    ) {
        this.claimsService.getAll(req.cookies.access_token, careerType)
        .then(claims => {
            res.status(http.OK).send({ error: null, claims, });
        }).catch(errorHandlerCallback(res));
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
        }).catch(errorHandlerCallback(res));
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
        }).catch(errorHandlerCallback(res));
    }
}

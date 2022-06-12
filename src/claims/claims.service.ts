import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Claim } from './schemas/claim.schema';
import { CreateClaimDto } from './dto/create-claim.dto';

@Injectable()
export class ClaimsService {
    constructor(@InjectModel(Claim.name) private claimModel: Model<Claim>) {}

    async create(claimsData: CreateClaimDto) {
        let latestId = await this.claimModel.findOne();
        return await this.claimModel.create({...claimsData, id : parseInt(latestId ? latestId.id : 0)+1});
    }
}

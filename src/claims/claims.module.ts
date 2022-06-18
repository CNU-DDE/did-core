import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {SsiModule} from 'src/ssi/ssi.module';
import { ClaimsController } from './claims.controller';
import { ClaimsService } from './claims.service';
import { Claim, ClaimSchema } from './schemas/claim.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Claim.name, schema: ClaimSchema }]),
        SsiModule,
    ],
    controllers: [ClaimsController],
    providers: [ClaimsService]
})

export class ClaimsModule {}

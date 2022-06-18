import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
    career_t,
    did_t,
} from 'did-core';
import { CareerType, ClaimStatus } from 'src/domain/enums.domain';

export class ClaimContent {
    @Prop({ required: true })
    from: string;

    @Prop({ required: true })
    to: string;

    @Prop({ required: true })
    where: string;

    @Prop({ required: true })
    what: string;
}

@Schema()
export class Claim extends Document {
    @Prop({ required: true })
    owner: did_t;

    @Prop({ required: true })
    issuer: did_t;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true, type: ClaimContent })
    content: ClaimContent;

    @Prop({ default: ClaimStatus.PENDING })
    status: ClaimStatus;

    @Prop({ required: true })
    careerType: CareerType;

    @Prop({ default: "" })
    career: career_t;
}

export const ClaimSchema = SchemaFactory.createForClass(Claim);

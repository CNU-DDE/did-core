import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
    ClaimContentInterface,
    did_t,
} from 'did-core';

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
    content: ClaimContentInterface;

    //  VALUE   STATUS
    //  0       PENDING
    //  1       ACCEPTED
    //  2       REJECTED
    @Prop({ default: 0 })
    status: number;

    //  VALUE   STATUS
    //  0       ENC_VC
    //  1       IPFS
    @Prop({ required: true })
    careerType: number;

    // ENC_VC or IPFS_HASH
    @Prop({ default: "" })
    career: string;
}

export const ClaimSchema = SchemaFactory.createForClass(Claim);

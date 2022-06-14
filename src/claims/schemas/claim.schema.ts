import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
    ClaimContentInterface,
    did_t,
} from 'did-core';

@Schema()
export class ClaimContent extends Document {
    @Prop({ required: true })
    from: string;

    @Prop({ required: true })
    to: string;

    @Prop({ required: true })
    where: string;

    @Prop({ required: true })
    what: string;
}
export const ClaimContentSchema = SchemaFactory.createForClass(ClaimContent);

@Schema()
export class Claim extends Document {
    @Prop({ required: true })
    owner: did_t;

    @Prop({ required: true })
    issuer: did_t;

    @Prop({ required: true })
    title: string;

    @Prop({ type: ClaimContentSchema })
    content: ClaimContentInterface;

    @Prop({ default: 0 })
    status: number;

    @Prop({ default: "" })
    vc: string;
}

export const ClaimSchema = SchemaFactory.createForClass(Claim);
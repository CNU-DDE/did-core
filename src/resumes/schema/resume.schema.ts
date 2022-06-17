import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
    coverLetterId_t,
    did_t,
    ipfsHash_t,
    positionId_t,
    ResumeCareersInterface,
    vpJwt_t,
} from 'did-core';

export class Careers {
    @Prop({ default: "" })
    vp: vpJwt_t;

    @Prop({ type: [String], default: [] })
    smartCareers: ipfsHash_t[];
}

@Schema()
export class Resume extends Document {
    @Prop({ required: true })
    owner: did_t;

    @Prop({ required: true })
    verifier: did_t;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    positionId: positionId_t;

    @Prop({ type: [Number], default: [] })
    coverLetterIds: coverLetterId_t[];

    @Prop({ type: Careers, default: {} })
    careers: ResumeCareersInterface;
}

export const ResumeSchema = SchemaFactory.createForClass(Resume);

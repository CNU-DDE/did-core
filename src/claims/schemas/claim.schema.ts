/**
    Example doc for VC: {
        owner: "did:ethr:ropsten:0x03277c363b9844bcf27ef740f0024246ecee5f942c908611ae716ac6aed4737325",
        issuer: "did:ethr:ropsten:0x03c279a56d2422ca21b9bccc806ef0b6ac0b2085c391c39278b4fe68d591f63db1",
        title: "Example VC",
        content: {
            from: "2022-01-01",
            to: "2022-02-02",
            where: "injik",
            what: "something"
        },

    }
 */
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

    @Prop({ required: true, type: ClaimContentSchema })
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

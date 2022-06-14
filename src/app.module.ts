import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClaimsModule } from './claims/claims.module';
import * as mongo from 'src/config/mongodb.config';

@Module({
    imports: [
        MongooseModule.forRoot(mongo.getURL()),
        ClaimsModule,
    ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClaimsModule } from './claims/claims.module';

@Module({
    imports: [
        MongooseModule.forRoot('mongodb://didcore:toor@127.0.0.1:27017/didcore'),
        ClaimsModule,
    ],
})
export class AppModule {}

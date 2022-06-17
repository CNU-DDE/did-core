import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClaimsModule } from './claims/claims.module';
import { ResumesModule } from './resumes/resumes.module';
import Env from './config/env.config';

@Module({
    imports: [
        MongooseModule.forRoot(`mongodb://${Env.get('mongodb.user')}:${Env.get('mongodb.password')}@${Env.get('mongodb.host')}:${Env.get('mongodb.port')}/${Env.get('mongodb.database')}`),
        ClaimsModule,
        ResumesModule,
    ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import settings from './settings';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: settings.MARIADB_HOST,
            port: settings.MARIADB_PORT,
            username: settings.MARIADB_USER,
            password: settings.MARIADB_PASSWORD,
            database: settings.MARIADB_DATABASE,
            entities: [],
            synchronize: true,
            autoLoadEntities: true,
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})

export class AppModule {}

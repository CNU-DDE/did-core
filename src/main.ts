import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist : true,
            forbidNonWhitelisted : true,
            transform : true
        }),
    );
    await app.listen(7771, '0.0.0.0');
}
bootstrap();

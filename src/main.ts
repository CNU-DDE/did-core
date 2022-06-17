import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { bufferLogs: true });
    app.useLogger(app.get(Logger));
    app.use(cookieParser());
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist : true,
            forbidNonWhitelisted : true,
            transform : true
        }),
    );
    await app.listen(60071, '0.0.0.0');
}
bootstrap();

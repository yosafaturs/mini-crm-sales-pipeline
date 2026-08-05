import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS dengan daftar origin yang benar
  app.enableCors({
    origin: [
      'https://mini-crm-sales-pipeline.vercel.app',
      'https://mini-crm-sales-pipeline-ovmg.vercel.app',
      'http://localhost:3000'
    ],
    credentials: true,
  });

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 Mini CRM Backend running on port ${port}`);
}
bootstrap();
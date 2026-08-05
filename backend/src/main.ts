import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
  origin: [
    'https://mini-crm-sales-pipeline.vercel.app',  // Production
    'https://mini-crm-sales-pipeline-ovmg.vercel.app',  // Preview
    'http://localhost:3000'  // Lokal (opsional)
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
  console.log(`🚀 Mini CRM Backend running on http://localhost:${port}`);
}
bootstrap();

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  // CORS is restricted to an explicit allowlist (never `cors: true`, which reflects any
  // origin). The public site + admin are same-project Next.js on known hosts; anything
  // else is rejected. Set CORS_ORIGINS to the deployed web origin(s), comma-separated.
  const corsOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: corsOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    },
  });

  app.use(helmet());
  // Every endpoint is versioned at /api/v1 (Harness §4).
  app.setGlobalPrefix('api/v1');
  // Validate + strip unknown fields at the boundary; 422 on invalid input.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      errorHttpStatusCode: 422,
    }),
  );

  const port = Number(process.env.API_PORT ?? 4000);
  await app.listen(port);
  new Logger('Bootstrap').log(`PBB API listening on http://localhost:${port}/api/v1`);
}

void bootstrap();

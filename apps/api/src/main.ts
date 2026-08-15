import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import type { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/http-exception.filter';
import { LoggingInterceptor } from './common/logging.interceptor';

async function bootstrap(): Promise<void> {
  // CORS is an explicit allowlist (never `cors: true`). The localhost default applies ONLY
  // in non-production; in production an unset CORS_ORIGINS fails CLOSED (refuse to boot)
  // rather than falling back to a permissive value, and "*" is rejected outright because a
  // wildcard origin with credentials is unsafe.
  const isProd = process.env.NODE_ENV === 'production';
  const rawOrigins =
    process.env.CORS_ORIGINS ??
    (isProd
      ? ''
      : 'http://localhost:3000,http://localhost:3001,http://localhost:3002,http://127.0.0.1:3000,http://127.0.0.1:3001,http://127.0.0.1:3002');
  const corsOrigins = rawOrigins.split(',').map((s) => s.trim()).filter(Boolean);
  if (isProd && corsOrigins.length === 0) {
    throw new Error('CORS_ORIGINS must be set explicitly in production - refusing to start with no allowlist.');
  }
  if (corsOrigins.includes('*')) {
    throw new Error('CORS_ORIGINS may not be "*" - a wildcard origin with credentials is unsafe.');
  }
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: corsOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    },
  });

  app.use(helmet());

  // Give every request a stable id (accept an inbound one, else generate) and echo it back,
  // so a client and the server logs can be correlated (layer 12).
  app.use((req: Request, res: Response, next: NextFunction) => {
    const incoming = req.headers['x-request-id'];
    const id = (Array.isArray(incoming) ? incoming[0] : incoming) || randomUUID();
    req.headers['x-request-id'] = id;
    res.setHeader('x-request-id', id);
    next();
  });

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
  // Consistent error envelope + one access-log line per request (layer 12).
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  const port = Number(process.env.API_PORT ?? 4000);
  await app.listen(port);
  new Logger('Bootstrap').log(`PBB API listening on http://localhost:${port}/api/v1`);
}

void bootstrap();

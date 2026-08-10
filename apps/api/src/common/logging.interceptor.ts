import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import type { Request, Response } from 'express';

/**
 * Structured access log (layer 12): one line per request with method, path, status, duration
 * and the request id. Errors are logged by the exception filter, so this only records the
 * successful completions to avoid double logging.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Request');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    const startedAt = Date.now();
    const requestId = (req.headers['x-request-id'] as string) || '-';

    return next.handle().pipe(
      tap(() => {
        this.logger.log(
          `${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - startedAt}ms [${requestId}]`,
        );
      }),
    );
  }
}

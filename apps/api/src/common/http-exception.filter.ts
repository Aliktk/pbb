import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

interface ErrorBody {
  ok: false;
  error: { statusCode: number; message: string; code?: string; requestId?: string };
}

/**
 * One error shape for the whole API (layer 12). Every failure becomes
 * { ok:false, error:{ statusCode, message, ... } } and is logged with the request id. In
 * production the body of an unexpected 500 is a generic message so internal details and stack
 * traces never reach a client; the full stack still goes to the server log.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Http');
  private readonly isProd = process.env.NODE_ENV === 'production';

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const requestId = (req.headers['x-request-id'] as string) || undefined;

    const isHttp = exception instanceof HttpException;
    const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';
    let code: string | undefined;

    if (isHttp) {
      const payload = exception.getResponse();
      if (typeof payload === 'string') {
        message = payload;
      } else if (payload && typeof payload === 'object') {
        const obj = payload as { message?: string | string[]; error?: string };
        message = Array.isArray(obj.message) ? obj.message.join('; ') : obj.message ?? exception.message;
        code = obj.error;
      }
    } else if (!this.isProd && exception instanceof Error) {
      message = exception.message;
    }

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${req.method} ${req.originalUrl} ${status} [${requestId ?? '-'}]`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(`${req.method} ${req.originalUrl} ${status} [${requestId ?? '-'}] ${message}`);
    }

    const body: ErrorBody = {
      ok: false,
      error: { statusCode: status, message, ...(code ? { code } : {}), ...(requestId ? { requestId } : {}) },
    };
    res.status(status).json(body);
  }
}

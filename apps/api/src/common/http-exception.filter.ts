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

function sanitizeErrorMessage(status: number, rawMessage: string): string {
  const lower = rawMessage.toLowerCase();

  if (
    lower.includes("can't reach database") ||
    lower.includes('prisma') ||
    lower.includes('invocation in') ||
    lower.includes('econnrefused') ||
    lower.includes('connection pool') ||
    lower.includes('timed out') ||
    lower.includes('socket closed') ||
    lower.includes('denied for user')
  ) {
    return 'Unable to connect to the database server. Please verify database availability or try again in a few moments.';
  }

  if (status === 401) {
    return rawMessage.includes('Invalid credentials') || rawMessage.includes('Invalid email') || rawMessage.includes('Unauthorized')
      ? rawMessage
      : 'Invalid email address or password.';
  }

  if (status === 403) {
    return 'Access denied. You do not have permission to perform this action.';
  }

  if (status >= 500) {
    return 'An unexpected server error occurred. Please try again later.';
  }

  return rawMessage;
}

/**
 * One error shape for the whole API (layer 12). Every failure becomes
 * { ok:false, error:{ statusCode, message, ... } } and is logged with the request id.
 * Internal details, SQL/Prisma traces, and stack traces are logged on the server
 * but sanitized into clean, user-friendly messages for the client response.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Http');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const requestId = (req.headers['x-request-id'] as string) || undefined;

    const isHttp = exception instanceof HttpException;
    const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let rawMessage = 'Internal server error';
    let code: string | undefined;

    if (isHttp) {
      const payload = exception.getResponse();
      if (typeof payload === 'string') {
        rawMessage = payload;
      } else if (payload && typeof payload === 'object') {
        const obj = payload as { message?: string | string[]; error?: string };
        rawMessage = Array.isArray(obj.message) ? obj.message.join('; ') : obj.message ?? exception.message;
        code = obj.error;
      }
    } else if (exception instanceof Error) {
      rawMessage = exception.message;
    }

    const message = sanitizeErrorMessage(status, rawMessage);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${req.method} ${req.originalUrl} ${status} [${requestId ?? '-'}] - Raw: ${rawMessage}`,
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

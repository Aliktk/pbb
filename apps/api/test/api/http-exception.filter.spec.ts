import { describe, it, expect, vi, beforeAll } from 'vitest';
import { BadRequestException, Logger, type ArgumentsHost } from '@nestjs/common';
import { AllExceptionsFilter } from '../../src/common/http-exception.filter';

beforeAll(() => {
  // Keep the test output quiet; the filter logs every failure it maps.
  vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
});

function run(exception: unknown, headers: Record<string, string> = {}) {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    status(code: number) { this.statusCode = code; return this; },
    json(payload: unknown) { this.body = payload; return this; },
  };
  const req = { method: 'POST', originalUrl: '/api/v1/x', headers };
  const host = { switchToHttp: () => ({ getResponse: () => res, getRequest: () => req }) } as unknown as ArgumentsHost;
  new AllExceptionsFilter().catch(exception, host);
  return res;
}

describe('AllExceptionsFilter', () => {
  it('maps an HttpException to the error envelope', () => {
    const res = run(new BadRequestException('Unknown town'));
    expect(res.statusCode).toBe(400);
    expect(res.body).toMatchObject({ ok: false, error: { statusCode: 400, message: 'Unknown town' } });
  });

  it('joins class-validator message arrays and keeps the error code', () => {
    const res = run(new BadRequestException({ message: ['a must be set', 'b too'], error: 'Bad Request' }));
    expect(res.body).toMatchObject({
      ok: false,
      error: { statusCode: 400, message: 'a must be set; b too', code: 'Bad Request' },
    });
  });

  it('treats an unknown error as 500', () => {
    const res = run(new Error('boom'));
    expect(res.statusCode).toBe(500);
    expect((res.body as { ok: boolean }).ok).toBe(false);
  });

  it('echoes the request id when present', () => {
    const res = run(new BadRequestException('x'), { 'x-request-id': 'req-123' });
    expect((res.body as { error: { requestId?: string } }).error.requestId).toBe('req-123');
  });
});

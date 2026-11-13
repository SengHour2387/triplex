import { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { z } from 'zod';

import { AppError, isAppError, toAppError } from './appError';

const config = {} as InternalAxiosRequestConfig;
const httpError = (status: number, data?: unknown) =>
  new AxiosError('x', 'ERR_BAD_REQUEST', config, null, { status, statusText: '', headers: {}, config, data });

describe('toAppError', () => {
  it('is idempotent', () => {
    const original = new AppError({ kind: 'unknown', message: 'm' });
    expect(toAppError(original)).toBe(original);
  });

  it.each([
    [401, 'unauthorized'],
    [403, 'forbidden'],
    [404, 'not_found'],
    [400, 'bad_request'],
    [409, 'bad_request'],
    [500, 'server'],
    [503, 'server'],
  ])('HTTP %i → %s', (status, kind) => {
    const error = toAppError(httpError(status));
    expect(error).toMatchObject({ kind, status });
    expect(error.isTransient).toBe(kind === 'server');
  });

  it('uses the backend code for the message', () => {
    const error = toAppError(httpError(400, { status: 'error', message: 'profile/change_username_username_taken' }));
    expect(error.code).toBe('profile/change_username_username_taken');
    expect(error.message).toBe('That username is already taken.');
  });

  it('never shows an unknown backend code or a raw backend string', () => {
    const unknownCode = toAppError(httpError(400, { status: 'error', message: 'brand/new_code' }));
    expect(unknownCode.code).toBe('brand/new_code'); // kept for logging…
    expect(unknownCode.message).toBe('Something was wrong with that request.'); // …but not shown

    const rawString = toAppError(httpError(500, { status: 'error', message: 'Failed to log in', error: 'SELECT * …' }));
    expect(rawString.code).toBeUndefined();
    expect(rawString.message).not.toMatch(/log in|SELECT/);
  });

  it('survives bodies that are not the documented shape', () => {
    for (const body of [undefined, null, '<html>502</html>', 42, { message: 7 }]) {
      expect(toAppError(httpError(502, body)).kind).toBe('server');
    }
  });

  it.each([
    ['ERR_NETWORK', 'network'],
    ['ECONNABORTED', 'timeout'],
    ['ETIMEDOUT', 'timeout'],
    ['ECONNREFUSED', 'network'],
  ])('no response + %s → %s', (code, kind) => {
    const error = toAppError(new AxiosError('x', code, config));
    expect(error.kind).toBe(kind);
    expect(error.isTransient).toBe(true);
  });

  it('maps a ZodError to invalid_response', () => {
    const result = z.object({ a: z.string() }).safeParse({});
    if (result.success) throw new Error('unreachable');
    expect(toAppError(result.error).kind).toBe('invalid_response');
  });

  it('wraps anything else (including non-Errors) as unknown, keeping the cause', () => {
    const cause = new TypeError('boom');
    const error = toAppError(cause);
    expect(error).toMatchObject({ kind: 'unknown', cause });
    expect(error.message).not.toMatch(/boom/);
    expect(isAppError(toAppError('a string'))).toBe(true);
    expect(isAppError(toAppError(undefined))).toBe(true);
  });
});

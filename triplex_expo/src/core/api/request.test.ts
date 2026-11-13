import type { AxiosInstance } from 'axios';
import { z } from 'zod';

import { authResponseSchema, profileMeResponseSchema } from './schemas';
import { send } from './request';

jest.mock('../logger', () => ({ logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() } }));

const clientReturning = (data: unknown, status = 200) =>
  ({ request: jest.fn().mockResolvedValue({ data, status }) }) as unknown as AxiosInstance;

describe('send (validation at the API boundary)', () => {
  it('returns typed, parsed data', async () => {
    const data = await send(clientReturning({ a: 'x', extra: 1 }), { url: 'u' }, z.object({ a: z.string() }));
    expect(data).toEqual({ a: 'x' });
  });

  it('a payload that does not match the schema is an AppError, not an undefined access later', async () => {
    await expect(send(clientReturning({ user: null }), { url: 'profile/me' }, profileMeResponseSchema)).rejects.toMatchObject({
      name: 'AppError',
      kind: 'invalid_response',
    });
  });

  it('an HTML error page served with 200 is rejected', async () => {
    await expect(send(clientReturning('<html></html>'), { url: 'x' }, authResponseSchema)).rejects.toMatchObject({
      kind: 'invalid_response',
    });
  });
});

describe('schemas', () => {
  const user = { id: 'u1', username: 'jo', email: 'jo@x.co', name: null, phone: null, avatar_url: null };

  it('accepts the documented login response (nulls for unset columns)', () => {
    expect(authResponseSchema.safeParse({ status: 'success', accessToken: 'a', refreshToken: 'r', user }).success).toBe(true);
  });

  it.each([
    ['empty access token', { accessToken: '', refreshToken: 'r', user }],
    ['missing refresh token', { accessToken: 'a', user }],
    ['user without id', { accessToken: 'a', refreshToken: 'r', user: { username: 'jo', email: 'e' } }],
  ])('rejects %s', (_name, body) => {
    expect(authResponseSchema.safeParse(body).success).toBe(false);
  });
});

import { AppError } from '../../../core/errors/appError';
import { applyAccountChanges, type AccountWriter } from './applyAccountChanges';
import { describeSaveResult } from './describeSaveResult';

const user = { id: '1', username: 'jo', email: 'jo@x.co' };
const afterUsername = { ...user, username: 'jo2' };
const afterEmail = { ...afterUsername, email: 'new@x.co' };
const fail = (message: string) => new AppError({ kind: 'bad_request', message, status: 400 });

function writer(overrides: Partial<AccountWriter> = {}): jest.Mocked<AccountWriter> {
  return {
    changeUsername: jest.fn().mockResolvedValue(afterUsername),
    changeEmail: jest.fn().mockResolvedValue(afterEmail),
    ...overrides,
  } as jest.Mocked<AccountWriter>;
}

describe('applyAccountChanges', () => {
  it('username only: one call, no password needed', async () => {
    const api = writer();
    const result = await applyAccountChanges({ username: 'jo2' }, undefined, api);
    expect(result).toEqual({ ok: true, user: afterUsername });
    expect(api.changeEmail).not.toHaveBeenCalled();
  });

  it('email only: sends the password', async () => {
    const api = writer();
    await applyAccountChanges({ email: 'new@x.co' }, 'pw', api);
    expect(api.changeEmail).toHaveBeenCalledWith('new@x.co', 'pw');
    expect(api.changeUsername).not.toHaveBeenCalled();
  });

  it('both: username FIRST, then email, and ends with the email response', async () => {
    const order: string[] = [];
    const api = writer({
      changeUsername: jest.fn(async () => (order.push('username'), afterUsername)),
      changeEmail: jest.fn(async () => (order.push('email'), afterEmail)),
    });
    const result = await applyAccountChanges({ username: 'jo2', email: 'new@x.co' }, 'pw', api);
    expect(order).toEqual(['username', 'email']);
    expect(result).toEqual({ ok: true, user: afterEmail });
  });

  it('a username failure stops everything: the email is never attempted', async () => {
    const api = writer({ changeUsername: jest.fn().mockRejectedValue(fail('That username is already taken.')) });
    const result = await applyAccountChanges({ username: 'jo2', email: 'new@x.co' }, 'pw', api);
    expect(api.changeEmail).not.toHaveBeenCalled();
    expect(result).toMatchObject({ ok: false, failed: 'username', done: 'none', user: null });
  });

  it('PARTIAL failure: username saved, email rejected → says so and carries the post-username user', async () => {
    const api = writer({ changeEmail: jest.fn().mockRejectedValue(fail('That password is incorrect.')) });
    const result = await applyAccountChanges({ username: 'jo2', email: 'new@x.co' }, 'bad', api);
    expect(result).toMatchObject({ ok: false, failed: 'email', done: 'username', user: afterUsername });
    expect(describeSaveResult(result, { username: 'jo2', email: 'new@x.co' }).message).toBe(
      'Your username was changed, but your email was not. That password is incorrect.',
    );
  });

  it('email-only failure carries the plain server message and no user', async () => {
    const api = writer({ changeEmail: jest.fn().mockRejectedValue(fail('That email is already in use.')) });
    const result = await applyAccountChanges({ email: 'new@x.co' }, 'pw', api);
    expect(result).toMatchObject({ ok: false, failed: 'email', done: 'none', user: null });
    expect(describeSaveResult(result, { email: 'new@x.co' })).toEqual({ ok: false, message: 'That email is already in use.' });
  });

  it('turns a non-AppError rejection into a safe AppError', async () => {
    const api = writer({ changeUsername: jest.fn().mockRejectedValue(new TypeError('x is undefined')) });
    const result = await applyAccountChanges({ username: 'jo2' }, undefined, api);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).not.toMatch(/undefined/);
  });
});

describe('describeSaveResult (success)', () => {
  it('names what happened', () => {
    expect(describeSaveResult({ ok: true, user }, { username: 'jo2' }).message).toBe('Username updated.');
    expect(describeSaveResult({ ok: true, user }, { email: 'a@b.co' }).message).toBe('Account updated.');
    expect(describeSaveResult({ ok: true, user }, { username: 'jo2', email: 'a@b.co' }).message).toBe('Account updated.');
  });
});

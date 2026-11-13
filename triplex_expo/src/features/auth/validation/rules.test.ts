import { hasErrors, toLoginCredentials, validateLogin, validateRegister } from './rules';

describe('validateLogin', () => {
  it('accepts a username or an email', () => {
    expect(validateLogin({ identifier: 'jo_doe', password: 'x' })).toEqual({});
    expect(validateLogin({ identifier: ' jo@x.co ', password: 'x' })).toEqual({});
  });

  it('flags empty fields and a malformed email', () => {
    expect(validateLogin({ identifier: '  ', password: '' })).toEqual({
      identifier: 'Enter your username or email.',
      password: 'Enter your password.',
    });
    expect(validateLogin({ identifier: 'jo@', password: 'x' }).identifier).toMatch(/valid email/);
  });

  it('puts no length rule on existing accounts’ passwords', () => {
    expect(hasErrors(validateLogin({ identifier: 'jo', password: 'a' }))).toBe(false);
  });
});

describe('toLoginCredentials', () => {
  it('uses the email endpoint shape when the identifier has an @', () => {
    expect(toLoginCredentials({ identifier: ' jo@x.co', password: 'p' })).toEqual({ email: 'jo@x.co', password: 'p' });
  });
  it('uses the username shape otherwise', () => {
    expect(toLoginCredentials({ identifier: 'jo_doe ', password: 'p' })).toEqual({ username: 'jo_doe', password: 'p' });
  });
});

describe('validateRegister', () => {
  const ok = { username: 'jo_doe', email: 'jo@x.co', password: 'longenough' };

  it('accepts valid input', () => expect(validateRegister(ok)).toEqual({}));

  it.each([
    ['ab', false],
    ['abc', true],
    ['a'.repeat(30), true],
    ['a'.repeat(31), false],
    ['jo doe', false],
    ['jo-doe', false],
    ['jo.doe', false],
    ['Jo_9', true],
  ])('username %j valid=%s', (username, valid) => {
    expect('username' in validateRegister({ ...ok, username })).toBe(!valid);
  });

  it.each(['', 'jo', 'jo@x', '@x.co', 'j o@x.co'])('rejects email %j', (email) => {
    expect(validateRegister({ ...ok, email }).email).toBeDefined();
  });

  it('requires 8+ password characters', () => {
    expect(validateRegister({ ...ok, password: '1234567' }).password).toMatch(/8/);
    expect(validateRegister({ ...ok, password: '12345678' }).password).toBeUndefined();
  });

  it('reports every bad field at once', () => {
    expect(Object.keys(validateRegister({ username: '', email: '', password: '' }))).toHaveLength(3);
  });
});

describe('hasErrors', () => {
  it('ignores cleared (undefined) entries', () => {
    expect(hasErrors({ a: undefined })).toBe(false);
    expect(hasErrors({ a: 'x' })).toBe(true);
  });
});

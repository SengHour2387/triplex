import { canSave, containsEmoji, diffAccount, normalizeEmail, validateEmail, validateUsername } from './accountForm';

const me = { username: 'jo_doe', email: 'jo@x.co' };

describe('validateUsername', () => {
  it.each(['abc', 'Jo_Doe_1', 'a'.repeat(30)])('accepts %s', (name) => expect(validateUsername(name)).toBeNull());
  it.each([
    ['', 'cannot be empty'],
    ['   ', 'cannot be empty'],
    ['ab', '3–30'],
    ['a'.repeat(31), '3–30'],
    ['jo doe', '3–30'],
    ['jo-doe', '3–30'],
    ['jo😀e', 'Emoji'],
  ])('rejects %j', (name, message) => expect(validateUsername(name)).toContain(message));
  it('trims before checking', () => expect(validateUsername('  jo_doe  ')).toBeNull());
});

describe('validateEmail', () => {
  it('accepts a normal address, any case, padded', () => expect(validateEmail('  Jo@X.co ')).toBeNull());
  it.each(['', 'jo', 'jo@x', '@x.co', 'jo @x.co', 'jo@@x.co'])('rejects %j', (value) => expect(validateEmail(value)).not.toBeNull());
  it('rejects emoji', () => expect(validateEmail('jo😀@x.co')).toContain('Emoji'));
});

describe('containsEmoji', () => {
  it.each(['😀', '👍🏽', '❤️', '🇰🇭', '✈'])('detects %s', (value) => expect(containsEmoji(value)).toBe(true));
  it.each(['abc', 'ខ្មែរ', 'é', '123_'])('ignores %s', (value) => expect(containsEmoji(value)).toBe(false));
});

describe('diffAccount', () => {
  it('is empty when nothing changed, ignoring email case and padding', () => {
    expect(diffAccount(me, { username: ' jo_doe ', email: 'JO@x.co ' })).toEqual({});
  });
  it('reports only what changed, normalised', () => {
    expect(diffAccount(me, { username: 'jo2', email: 'jo@x.co' })).toEqual({ username: 'jo2' });
    expect(diffAccount(me, { username: 'jo_doe', email: ' New@X.co' })).toEqual({ email: 'new@x.co' });
    expect(normalizeEmail(' New@X.co')).toBe('new@x.co');
  });
  it('treats a username case change as a change (usernames are case-sensitive)', () => {
    expect(diffAccount(me, { username: 'Jo_Doe', email: me.email })).toEqual({ username: 'Jo_Doe' });
  });
});

describe('canSave', () => {
  const changed = { username: 'jo_doe2', email: me.email };
  it('needs a change', () => expect(canSave(me, me, 'idle', false)).toBe(false));
  it('allows a valid change', () => expect(canSave(changed, me, 'available', false)).toBe(true));
  it.each(['checking', 'taken', 'invalid'] as const)('blocks while the username is %s', (status) => {
    expect(canSave(changed, me, status, false)).toBe(false);
  });
  it('allows an unverified username (the server decides)', () => expect(canSave(changed, me, 'unverified', false)).toBe(true));
  it('blocks while saving', () => expect(canSave(changed, me, 'available', true)).toBe(false));
  it('blocks an invalid email even when the username is fine', () => {
    expect(canSave({ username: 'jo_doe', email: 'nope' }, me, 'idle', false)).toBe(false);
  });
});

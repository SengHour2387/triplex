import { displayName } from './displayName';

describe('displayName', () => {
  it('prefers the name, trimmed', () => {
    expect(displayName({ name: '  Jo Doe ', username: 'jo_doe' })).toBe('Jo Doe');
  });
  it.each([null, undefined, '', '   '])('falls back to the username when name is %p', (name) => {
    expect(displayName({ name, username: 'jo_doe' })).toBe('jo_doe');
  });
});

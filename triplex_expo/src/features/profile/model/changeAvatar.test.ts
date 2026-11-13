import { AppError } from '../../../core/errors/appError';
import { changeAvatar, type ChangeAvatarSteps } from './changeAvatar';

const user = { id: '1', username: 'jo', email: 'jo@x.co', avatar_url: null };
const picked = { kind: 'picked', uri: 'file:///big.jpg', width: 4000, height: 3000 } as const;
const prepared = { uri: 'file:///small.jpg', name: 'avatar.jpg', type: 'image/jpeg' };

function steps(overrides: Partial<ChangeAvatarSteps> = {}): jest.Mocked<ChangeAvatarSteps> {
  return {
    pick: jest.fn().mockResolvedValue(picked),
    prepare: jest.fn().mockResolvedValue(prepared),
    upload: jest.fn(async (_file, onProgress) => (onProgress(50), onProgress(100), 'https://cdn/new.jpg')),
    onProgress: jest.fn(),
    ...overrides,
  } as jest.Mocked<ChangeAvatarSteps>;
}

describe('changeAvatar', () => {
  it('pick → prepare → upload, and returns the user with the new avatar', async () => {
    const s = steps();
    const result = await changeAvatar('library', user, s);
    expect(s.pick).toHaveBeenCalledWith('library');
    expect(s.prepare).toHaveBeenCalledWith(picked);
    expect(s.upload).toHaveBeenCalledWith(prepared, expect.any(Function));
    expect(result).toEqual({ kind: 'updated', user: { ...user, avatar_url: 'https://cdn/new.jpg' } });
  });

  it('reports progress 0 → 50 → 100, and ALWAYS finishes with null', async () => {
    const s = steps();
    await changeAvatar('camera', user, s);
    expect(s.onProgress.mock.calls.map(([p]) => p)).toEqual([0, 50, 100, null]);
  });

  it.each(['cancelled', 'denied', 'unavailable'] as const)('%s: stops at once — no progress, no upload', async (kind) => {
    const s = steps({ pick: jest.fn().mockResolvedValue({ kind }) });
    expect(await changeAvatar('camera', user, s)).toEqual({ kind });
    expect(s.prepare).not.toHaveBeenCalled();
    expect(s.upload).not.toHaveBeenCalled();
    expect(s.onProgress).not.toHaveBeenCalled();
  });

  it('a failed upload becomes a user-safe failure and clears the progress', async () => {
    const error = new AppError({ kind: 'server', message: 'Something went wrong on our side. Please try again.', status: 500 });
    const s = steps({ upload: jest.fn().mockRejectedValue(error) });
    const result = await changeAvatar('library', user, s);
    expect(result).toEqual({ kind: 'failed', error });
    expect(s.onProgress).toHaveBeenLastCalledWith(null);
  });

  it('a failure while shrinking the photo is handled the same way (and never throws raw)', async () => {
    const s = steps({ prepare: jest.fn().mockRejectedValue(new TypeError('native module exploded')) });
    const result = await changeAvatar('library', user, s);
    expect(result.kind).toBe('failed');
    if (result.kind === 'failed') expect(result.error.message).not.toMatch(/exploded/);
    expect(s.upload).not.toHaveBeenCalled();
    expect(s.onProgress).toHaveBeenLastCalledWith(null);
  });
});

import { AppError } from '../../../core/errors/appError';
import { AVATAR_FIELD, ProfileApi } from './profileApi';

const mockRequest = jest.fn();
jest.mock('../../../core/api/client', () => ({ apiClient: { request: (config: unknown) => mockRequest(config) } }));
jest.mock('../../../core/logger', () => ({ logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() } }));

const file = { uri: 'file:///a.jpg', name: 'a.jpg', type: 'image/jpeg' };

beforeEach(() => mockRequest.mockReset());

describe('ProfileApi.uploadAvatar', () => {
  it('POSTs multipart form data with the file in the `image` field, and returns the new URL', async () => {
    mockRequest.mockResolvedValue({ status: 200, data: { status: 'success', avatarUrl: 'https://cdn/a.jpg', mediaId: 'x' } });
    const url = await ProfileApi.uploadAvatar(file);

    expect(url).toBe('https://cdn/a.jpg');
    const config = mockRequest.mock.calls[0][0];
    expect(config).toMatchObject({ method: 'post', url: 'profile/profile-picture', headers: { 'Content-Type': 'multipart/form-data' } });
    expect(config.data).toBeInstanceOf(FormData);
    expect(AVATAR_FIELD).toBe('image');
    expect(config.timeout).toBeGreaterThan(30_000);
  });

  it('turns bytes sent into a 0–100 percentage', async () => {
    const seen: number[] = [];
    mockRequest.mockImplementation(async (config: { onUploadProgress: (e: { loaded: number; total?: number }) => void }) => {
      config.onUploadProgress({ loaded: 250, total: 1000 });
      config.onUploadProgress({ loaded: 1000, total: 1000 });
      config.onUploadProgress({ loaded: 5 }); // unknown total: ignored
      return { status: 200, data: { avatarUrl: 'https://cdn/a.jpg' } };
    });
    await ProfileApi.uploadAvatar(file, (p) => seen.push(p));
    expect(seen).toEqual([25, 100]);
  });

  it('a reply without an avatar URL is an invalid_response, not a silent undefined', async () => {
    mockRequest.mockResolvedValue({ status: 200, data: { status: 'success' } });
    await expect(ProfileApi.uploadAvatar(file)).rejects.toMatchObject({ kind: 'invalid_response' });
    await expect(ProfileApi.uploadAvatar(file)).rejects.toBeInstanceOf(AppError);
  });
});

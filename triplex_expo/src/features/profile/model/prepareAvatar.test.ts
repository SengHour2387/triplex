import { ImageManipulator } from 'expo-image-manipulator';

import { AVATAR_JPEG_QUALITY, AVATAR_MAX_SIDE, prepareAvatar } from './prepareAvatar';

const mockResize = jest.fn();
const mockSave = jest.fn();
jest.mock('expo-image-manipulator', () => ({
  SaveFormat: { JPEG: 'jpeg' },
  ImageManipulator: { manipulate: jest.fn() },
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockSave.mockResolvedValue({ uri: 'file:///out.jpg', width: 1280, height: 960 });
  jest.mocked(ImageManipulator.manipulate).mockReturnValue({
    resize: mockResize,
    renderAsync: async () => ({ saveAsync: mockSave }),
  } as never);
});

describe('prepareAvatar', () => {
  it('shrinks a landscape photo by its width', async () => {
    await prepareAvatar({ uri: 'file:///in.jpg', width: 4000, height: 3000 });
    expect(mockResize).toHaveBeenCalledWith({ width: AVATAR_MAX_SIDE });
  });

  it('shrinks a portrait photo by its height', async () => {
    await prepareAvatar({ uri: 'file:///in.jpg', width: 3000, height: 4000 });
    expect(mockResize).toHaveBeenCalledWith({ height: AVATAR_MAX_SIDE });
  });

  it('never enlarges a small photo', async () => {
    await prepareAvatar({ uri: 'file:///in.jpg', width: 800, height: 600 });
    expect(mockResize).not.toHaveBeenCalled();
  });

  it('saves a JPEG and describes it for upload', async () => {
    const out = await prepareAvatar({ uri: 'file:///in.jpg', width: 4000, height: 3000 });
    expect(mockSave).toHaveBeenCalledWith({ format: 'jpeg', compress: AVATAR_JPEG_QUALITY });
    expect(out).toMatchObject({ uri: 'file:///out.jpg', type: 'image/jpeg' });
    expect(out.name).toMatch(/^avatar-\d+\.jpg$/);
  });
});

import * as ImagePicker from 'expo-image-picker';

import { pickAvatar } from './pickAvatar';

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));
const picker = jest.mocked(ImagePicker);
const asset = { uri: 'file:///p.jpg', width: 3000, height: 2000 };

beforeEach(() => jest.resetAllMocks());

describe('pickAvatar — camera', () => {
  it('refused permission → denied, and the camera is never opened', async () => {
    picker.requestCameraPermissionsAsync.mockResolvedValue({ granted: false } as never);
    expect(await pickAvatar('camera')).toEqual({ kind: 'denied' });
    expect(picker.launchCameraAsync).not.toHaveBeenCalled();
  });

  it('no camera (simulator) → unavailable instead of crashing', async () => {
    picker.requestCameraPermissionsAsync.mockResolvedValue({ granted: true } as never);
    picker.launchCameraAsync.mockRejectedValue(new Error('Camera not available on simulator'));
    expect(await pickAvatar('camera')).toEqual({ kind: 'unavailable' });
  });

  it('a photo taken → picked', async () => {
    picker.requestCameraPermissionsAsync.mockResolvedValue({ granted: true } as never);
    picker.launchCameraAsync.mockResolvedValue({ canceled: false, assets: [asset] } as never);
    expect(await pickAvatar('camera')).toEqual({ kind: 'picked', ...asset });
  });

  it('closing the camera → cancelled', async () => {
    picker.requestCameraPermissionsAsync.mockResolvedValue({ granted: true } as never);
    picker.launchCameraAsync.mockResolvedValue({ canceled: true, assets: null } as never);
    expect(await pickAvatar('camera')).toEqual({ kind: 'cancelled' });
  });
});

describe('pickAvatar — photos', () => {
  it('asks for no permission (the system photo picker needs none) and returns the photo', async () => {
    picker.launchImageLibraryAsync.mockResolvedValue({ canceled: false, assets: [asset] } as never);
    expect(await pickAvatar('library')).toEqual({ kind: 'picked', ...asset });
    expect(picker.requestCameraPermissionsAsync).not.toHaveBeenCalled();
    expect(picker.launchImageLibraryAsync).toHaveBeenCalledWith(expect.objectContaining({ mediaTypes: ['images'] }));
  });

  it('dismissing the picker → cancelled', async () => {
    picker.launchImageLibraryAsync.mockResolvedValue({ canceled: true, assets: null } as never);
    expect(await pickAvatar('library')).toEqual({ kind: 'cancelled' });
  });

  it('an empty selection is also cancelled', async () => {
    picker.launchImageLibraryAsync.mockResolvedValue({ canceled: false, assets: [] } as never);
    expect(await pickAvatar('library')).toEqual({ kind: 'cancelled' });
  });
});

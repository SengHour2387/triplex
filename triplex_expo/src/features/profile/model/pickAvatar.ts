import * as ImagePicker from 'expo-image-picker';

export type AvatarSource = 'camera' | 'library';

export type PickResult =
  | { kind: 'picked'; uri: string; width: number; height: number }
  | { kind: 'cancelled' }
  /** The user refused camera access (so the system will not ask again — they must use Settings). */
  | { kind: 'denied' }
  /** There is no camera to open (the iOS Simulator, some tablets). */
  | { kind: 'unavailable' };

const OPTIONS: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 1, allowsMultipleSelection: false };

/**
 * Opens the system camera or the photo picker.
 *
 * The photo picker (PHPicker on iOS) runs out of process and needs no photo-library permission;
 * only the camera does.
 */
export async function pickAvatar(source: AvatarSource): Promise<PickResult> {
  let result: ImagePicker.ImagePickerResult;
  try {
    if (source === 'camera') {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) return { kind: 'denied' };
      result = await ImagePicker.launchCameraAsync(OPTIONS);
    } else {
      result = await ImagePicker.launchImageLibraryAsync(OPTIONS);
    }
  } catch {
    // The camera module throws when there is no camera. The library picker does not throw in practice.
    return { kind: 'unavailable' };
  }

  const asset = result.assets?.[0];
  if (result.canceled || !asset) return { kind: 'cancelled' };
  return { kind: 'picked', uri: asset.uri, width: asset.width, height: asset.height };
}

import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

/** Longest side of the uploaded avatar. It is shown at 92 pt (≈ 280 px) and in a full-screen viewer. */
export const AVATAR_MAX_SIDE = 1280;
export const AVATAR_JPEG_QUALITY = 0.8;

export interface PreparedImage {
  uri: string;
  name: string;
  type: string;
}

/**
 * Shrinks a freshly picked photo before it is uploaded (Flutter did the same: resize + recompress). A
 * 12-megapixel camera photo is several MB; the avatar needs a small fraction of that. Never enlarges.
 */
export async function prepareAvatar(source: { uri: string; width: number; height: number }): Promise<PreparedImage> {
  const context = ImageManipulator.manipulate(source.uri);
  const longest = Math.max(source.width, source.height);
  if (longest > AVATAR_MAX_SIDE) {
    context.resize(source.width >= source.height ? { width: AVATAR_MAX_SIDE } : { height: AVATAR_MAX_SIDE });
  }
  const image = await context.renderAsync();
  const result = await image.saveAsync({ format: SaveFormat.JPEG, compress: AVATAR_JPEG_QUALITY });
  return { uri: result.uri, name: `avatar-${Date.now()}.jpg`, type: 'image/jpeg' };
}

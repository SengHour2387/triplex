import { apiClient } from '../../../core/api/client';
import { Endpoints } from '../../../core/api/endpoints';
import { send } from '../../../core/api/request';
import { avatarUploadResponseSchema } from '../../../core/api/schemas';

export const AVATAR_FIELD = 'image';

export const ProfileApi = {
  /**
   * Uploads a local image as the profile picture (multipart, field `image`) and resolves to its URL.
   * `onProgress` receives 0–100 while the bytes go out.
   */
  async uploadAvatar(file: { uri: string; name: string; type: string }, onProgress?: (percent: number) => void): Promise<string> {
    const form = new FormData();
    // React Native's FormData takes a { uri, name, type } descriptor in place of a Blob.
    form.append(AVATAR_FIELD, file as unknown as Blob);

    const { avatarUrl } = await send(
      apiClient,
      {
        method: 'post',
        url: Endpoints.profile.profilePicture,
        data: form,
        // The client's default is JSON; the native layer adds the multipart boundary.
        headers: { 'Content-Type': 'multipart/form-data' },
        // A photo upload outlasts the normal request timeout on a slow connection.
        timeout: 60_000,
        onUploadProgress: (event) => {
          if (event.total) onProgress?.(Math.min(100, Math.round((event.loaded / event.total) * 100)));
        },
      },
      avatarUploadResponseSchema,
    );
    return avatarUrl;
  },
};

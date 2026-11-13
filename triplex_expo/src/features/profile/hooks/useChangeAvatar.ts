import * as Haptics from 'expo-haptics';
import { useCallback, useRef } from 'react';
import { Linking } from 'react-native';

import { toast } from '../../../design-system';
import { AuthApi } from '../../auth/api/authApi';
import { useAuthStore } from '../../auth/store/authStore';
import { ProfileApi } from '../api/profileApi';
import { changeAvatar } from '../model/changeAvatar';
import { pickAvatar, type AvatarSource } from '../model/pickAvatar';
import { prepareAvatar } from '../model/prepareAvatar';
import { useAvatarUploadStore } from '../store/avatarUploadStore';

/**
 * "Change profile picture" from the camera or the photo library, with the outcome told to the user:
 * a toast for success, a way to Settings when camera access was refused, and the server's message
 * when the upload fails. Also updates the session and the cached user so the new picture shows
 * everywhere and is still there after a restart.
 */
export function useChangeAvatar() {
  const updateUser = useAuthStore((s) => s.updateUser);
  const uploading = useAvatarUploadStore((s) => s.progress !== null);
  const busy = useRef(false);

  const change = useCallback(
    async (source: AvatarSource) => {
      const current = useAuthStore.getState().user;
      if (!current || busy.current) return;
      busy.current = true;
      try {
        const result = await changeAvatar(source, current, {
          pick: pickAvatar,
          prepare: prepareAvatar,
          upload: (file, onProgress) => ProfileApi.uploadAvatar(file, onProgress),
          onProgress: useAvatarUploadStore.getState().set,
        });

        switch (result.kind) {
          case 'updated': {
            // The session may have ended (or changed) while the photo was uploading.
            if (useAuthStore.getState().user?.id !== current.id) return;
            updateUser(result.user);
            await AuthApi.cacheUser(result.user);
            toast.success('Profile picture updated.');
            return;
          }
          case 'denied':
            toast.warning('Allow camera access in Settings to take a photo.', {
              actionLabel: 'Settings',
              onAction: () => void Linking.openSettings(),
            });
            return;
          case 'unavailable':
            toast.info("This device doesn't have a camera. Choose Photos instead.");
            return;
          case 'failed':
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            toast.error(result.error.message);
            return;
          case 'cancelled':
            return;
        }
      } finally {
        busy.current = false;
      }
    },
    [updateUser],
  );

  return { change, uploading };
}

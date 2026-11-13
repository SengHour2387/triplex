import { useRouter } from 'expo-router';

import { Toolbar } from '../../../src/design-system';
import { ProfileScreen, useChangeAvatar } from '../../../src/features/profile';

export default function ProfileRoute() {
  const router = useRouter();
  const { change, uploading } = useChangeAvatar();
  return (
    <>
      {/* Flutter's profile app bar: a camera button (change the profile picture) and Settings, top right.
          The system's toolbar items on iOS (Liquid Glass on iOS 26); drawn glass buttons on Android. */}
      <Toolbar
        placement="right"
        items={[
          {
            type: 'menu',
            icon: 'camera',
            label: 'Change profile picture',
            title: 'Profile picture',
            disabled: uploading,
            actions: [
              { label: 'Camera', icon: 'camera', onPress: () => void change('camera') },
              { label: 'Photos', icon: 'photo', onPress: () => void change('library') },
            ],
          },
          { type: 'button', icon: 'gear', label: 'Settings', onPress: () => router.push('/settings') },
        ]}
      />
      <ProfileScreen />
    </>
  );
}

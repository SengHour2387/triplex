import type { ExpoConfig } from 'expo/config';

/**
 * Native identity matches the shipped Flutter app (`com.templex.triplex` on both stores) so the
 * React Native build ships as an *update* to the existing listing.
 *
 * NOTE: icon + splash artwork are PLACEHOLDERS (Expo template images). A production icon master
 * does not exist in the repo yet — see MIGRATION_PLAN.md §9 #5. Must be replaced before Task 6.
 */
const config: ExpoConfig = {
  name: 'Triplex',
  slug: 'triplex',
  scheme: 'triplex',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  // 'automatic' follows the system. (The scaffold forced 'light', which made dark mode impossible.)
  userInterfaceStyle: 'automatic',
  ios: {
    bundleIdentifier: 'com.templex.triplex',
    // Flutter ships on iPad too (device family 1,2). iPad layouts are verified in Task 13.
    supportsTablet: true,
  },
  android: {
    package: 'com.templex.triplex',
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    // Revisited in Task 4 (navigation), which owns back-gesture behaviour.
    predictiveBackGestureEnabled: false,
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-image',
    [
      'expo-image-picker',
      {
        photosPermission: 'Triplex needs access to your photos so you can choose a profile picture or a photo for your posts.',
        cameraPermission: 'Triplex uses the camera so you can take a profile picture or a photo for your posts.',
        // No video / voice features: don't ask for the microphone.
        microphonePermission: false,
      },
    ],
    [
      'expo-splash-screen',
      {
        image: './assets/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
        dark: { backgroundColor: '#000000' },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
};

export default config;

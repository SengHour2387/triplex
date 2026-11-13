import { useQueryClient } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { QueryProvider } from '../src/core/query/QueryProvider';
import { DialogHost, ToastHost, useAppFonts, useSheetOptions, useStackScreenOptions } from '../src/design-system';
import { useAuthStore } from '../src/features/auth/store/authStore';
import { clearFeedSnapshot } from '../src/features/posts';
import { useThemeStore } from '../src/features/settings';

// Deep links (`triplex://settings`) that land on a screen above the tabs still have the tabs
// underneath, so back works from a cold start.
export const unstable_settings = { anchor: '(tabs)' };

// Held until fonts and session restore resolve — see RootLayout.
void SplashScreen.preventAutoHideAsync();

/** Drops every cached server response when the user signs out, so the next account never sees them. */
function ClearCacheOnSignOut() {
  const queryClient = useQueryClient();
  const status = useAuthStore((s) => s.status);
  useEffect(() => {
    if (status === 'unauthenticated') {
      queryClient.clear();
      void clearFeedSnapshot();
    }
  }, [status, queryClient]);
  return null;
}

export default function RootLayout() {
  const { loaded, error } = useAppFonts();
  const status = useAuthStore((s) => s.status);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const themeReady = useThemeStore((s) => s.hydrated);
  const hydrateTheme = useThemeStore((s) => s.hydrate);
  const stackOptions = useStackScreenOptions();
  const reactionsSheet = useSheetOptions({ detents: [0.65, 1] });
  const repostSheet = useSheetOptions({ detents: [0.75, 1] });
  const commentsSheet = useSheetOptions({ detents: [0.75, 1] });
  const gallerySheet = useSheetOptions({ detents: [0.5, 1] });
  const gallerySheetCompact = useSheetOptions({ detents: 'fitToContents' });

  // Restore the session and the saved theme once, at cold start.
  useEffect(() => {
    void checkAuth();
    void hydrateTheme();
  }, [checkAuth, hydrateTheme]);

  // The splash stays up until fonts, session restore AND the saved theme have resolved, so neither the
  // login screen nor the app ever flashes for the wrong state — or in the wrong colours.
  const ready = (loaded || error !== null) && status !== 'idle' && themeReady;
  const signedIn = status === 'authenticated';

  useEffect(() => {
    if (error) console.warn('[fonts] failed to load, using system fallback:', error.message);
    if (ready) void SplashScreen.hideAsync();
  }, [ready, error]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={styles.fill}>
      <SafeAreaProvider>
        <QueryProvider>
          <ClearCacheOnSignOut />
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            {/* Route guards: the router sends the user to the right side whenever `signedIn` flips. */}
            <Stack.Protected guard={signedIn}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="settings" />
              {/* A post on its own (`triplex://post/<id>`), pushed over the tabs like Settings. */}
              <Stack.Screen name="post/[id]" options={{ ...stackOptions, headerShown: true, title: 'Post', headerLargeTitle: false }} />
              <Stack.Screen name="reactions/[postId]" options={reactionsSheet} />
              <Stack.Screen name="repost/[postId]" options={repostSheet} />
              <Stack.Screen name="comments/[postId]" options={commentsSheet} />
              {/* The photo viewer floats over whatever screen opened it, so that screen blurs through. */}
              <Stack.Screen name="image-viewer" options={{ presentation: 'transparentModal', animation: 'fade', gestureEnabled: false, contentStyle: { backgroundColor: 'transparent' } }} />
            </Stack.Protected>
            <Stack.Protected guard={!signedIn}>
              <Stack.Screen name="(auth)" />
            </Stack.Protected>
            {/* Dev-only design gallery. Never reachable in release builds. */}
            <Stack.Protected guard={__DEV__ && signedIn}>
              <Stack.Screen name="gallery" />
              <Stack.Screen name="gallery-overlap" />
              <Stack.Screen name="gallery-tabs" />
              <Stack.Screen name="gallery-sheet" options={gallerySheet} />
              <Stack.Screen name="gallery-sheet-compact" options={gallerySheetCompact} />
            </Stack.Protected>
          </Stack>
          <ToastHost />
          <DialogHost />
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });

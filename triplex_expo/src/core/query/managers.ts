import { focusManager, onlineManager } from '@tanstack/react-query';
import * as Network from 'expo-network';
import { AppState, type AppStateStatus } from 'react-native';

import { logger } from '../logger';

/**
 * React Native has no `window` focus/online events, so TanStack Query needs to be told:
 * - **focus** = the app is in the foreground (`AppState`), so coming back from the background
 *   refetches stale data;
 * - **online** = the OS reports a reachable network (`expo-network`), so queries pause while offline
 *   and resume — retrying — when the connection returns.
 *
 * Returns a cleanup function. Call once at startup (see `QueryProvider`).
 */
export function setupQueryManagers(): () => void {
  const onAppState = (status: AppStateStatus) => focusManager.setFocused(status === 'active');
  const appStateSub = AppState.addEventListener('change', onAppState);

  const networkSub = Network.addNetworkStateListener(({ isConnected, isInternetReachable }) => {
    // `isInternetReachable` can be undefined while unknown; only an explicit `false` means offline.
    onlineManager.setOnline(Boolean(isConnected) && isInternetReachable !== false);
  });

  // The listener only fires on *changes*; seed the current state.
  Network.getNetworkStateAsync().then(
    ({ isConnected, isInternetReachable }) =>
      onlineManager.setOnline(Boolean(isConnected) && isInternetReachable !== false),
    (error: unknown) => logger.warn('[query] could not read the initial network state', error),
  );

  return () => {
    appStateSub.remove();
    networkSub.remove();
  };
}

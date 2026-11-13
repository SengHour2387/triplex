import { Platform } from 'react-native';

const DEV_API_PORT = 3000;

/**
 * Where the local dev backend is reachable from *inside* each simulator/emulator.
 * The Android emulator can't see the host's `localhost`; 10.0.2.2 is its alias for it.
 */
const DEV_HOST_BY_OS: Record<string, string> = {
  android: `10.0.2.2:${DEV_API_PORT}`,
};
const DEFAULT_DEV_HOST = `localhost:${DEV_API_PORT}`;

type ResolveBaseUrlInput = {
  /** Value of `EXPO_PUBLIC_API_URL` (full base URL including the `/api` path). */
  override?: string;
  os: string;
  isDev: boolean;
};

/**
 * Resolves the API base URL (always ending in `/`).
 *
 * - An explicit override always wins (use it for a LAN IP on a physical device, or for
 *   staging/production).
 * - Without one, development builds target the local backend.
 * - A release build with no override **throws** — silently shipping an app that talks to
 *   `localhost` is a worse failure than a loud one at startup.
 */
export function resolveBaseUrl({ override, os, isDev }: ResolveBaseUrlInput): string {
  const url = override?.trim();

  if (url) {
    if (!/^https?:\/\//i.test(url)) {
      throw new Error(
        `EXPO_PUBLIC_API_URL must start with http:// or https:// (got "${url}")`,
      );
    }
    return url.endsWith('/') ? url : `${url}/`;
  }

  if (!isDev) {
    throw new Error('EXPO_PUBLIC_API_URL must be set for release builds.');
  }

  return `http://${DEV_HOST_BY_OS[os] ?? DEFAULT_DEV_HOST}/api/`;
}

export const Env = {
  // `process.env.EXPO_PUBLIC_*` must be referenced literally so Metro can inline it.
  baseUrl: resolveBaseUrl({
    override: process.env.EXPO_PUBLIC_API_URL,
    os: Platform.OS,
    isDev: __DEV__,
  }),
  timeoutMs: 15000,
};

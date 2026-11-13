import { create } from 'zustand';

import type { SurfaceMode } from './glassTier';

/**
 * DEV TOOL. Lets the gallery force a surface mode (blur / frosted / solid) so every tier's code
 * path can be rendered and checked on a single device. Nothing sets it outside `app/gallery.tsx`,
 * which is not reachable in release builds, so in production the value is always `null`.
 *
 * NOTE: forcing `blur` on iOS 26 exercises the tier-B *code path*; it is not a substitute for a
 * run on a real iOS < 26 OS, and forcing `frosted` on iOS is not a substitute for Android.
 */
export const useDevSurfaceOverride = create<{
  mode: SurfaceMode | null;
  setMode: (mode: SurfaceMode | null) => void;
}>((set) => ({ mode: null, setMode: (mode) => set({ mode }) }));

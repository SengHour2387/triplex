/**
 * Which kind of glass the device can honestly draw.
 *
 *  - `liquid`  (tier A) — iOS 26+: the real system Liquid Glass (`expo-glass-effect`).
 *  - `blur`    (tier B) — iOS 16.4–25: a system material blur (`expo-blur`).
 *  - `frosted` (tier C) — Android: a translucent tinted surface. *Unverified* until the Android
 *                         pass (see MIGRATION_PLAN.md); no stock-Material look.
 *  - `solid`            — the user asked the system to reduce transparency: an opaque surface,
 *                         on every platform.
 */
export type SurfaceMode = 'liquid' | 'blur' | 'frosted' | 'solid';

export interface SurfaceModeInput {
  os: string;
  /** Result of `isLiquidGlassAvailable()` — false below iOS 26 and on other platforms. */
  liquidGlassAvailable: boolean;
  reduceTransparency: boolean;
}

/**
 * Pure so it can be tested exhaustively. Feature detection (`liquidGlassAvailable`) decides tier A,
 * never an OS-version string: it also covers an app built without the iOS 26 SDK, or with Liquid
 * Glass opted out in Info.plist.
 */
export function resolveSurfaceMode({
  os,
  liquidGlassAvailable,
  reduceTransparency,
}: SurfaceModeInput): SurfaceMode {
  if (reduceTransparency) return 'solid';
  if (os === 'ios') return liquidGlassAvailable ? 'liquid' : 'blur';
  return 'frosted';
}

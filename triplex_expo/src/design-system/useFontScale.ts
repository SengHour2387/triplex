import { useWindowDimensions } from 'react-native';

import { MAX_FONT_SCALE } from './tokens';

/** The effective text scale: the user's Dynamic Type setting, capped at what the layouts are built for. */
export const clampFontScale = (fontScale: number): number => Math.min(Math.max(fontScale, 1), MAX_FONT_SCALE);

/**
 * `lineHeight` and fixed layout metrics are in points and do NOT grow with the system text size, while
 * glyphs do (up to `MAX_FONT_SCALE`). Unscaled, each line box ends up shorter than its glyphs and the
 * bottom of the text is clipped. Multiply anything that must track the text by this.
 *
 * Re-renders when the user changes the text size.
 */
export function useFontScale(): number {
  return clampFontScale(useWindowDimensions().fontScale);
}

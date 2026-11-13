import MaskedView from '@react-native-masked-view/masked-view';
import { BlurView } from 'expo-blur';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fadeOpacities } from './blurFade';
import { useSurfaceMode } from './useSurfaceMode';
import { useTheme } from './useTheme';

const STEPS = 14;
const OPACITIES = fadeOpacities(STEPS);

/** A column of black strips whose alpha ramps 1 → 0: used as a mask, or (tinted) as a plain fade. */
function Fade({ height, color }: { height: number; color: string }) {
  return (
    <View style={{ height }}>
      {OPACITIES.map((opacity, i) => (
        <View key={i} style={{ flex: 1, backgroundColor: color, opacity }} />
      ))}
    </View>
  );
}

export interface ProgressiveBlurProps {
  /** Height *below* the status bar / top safe area over which the blur fades out. Default 28. */
  fadeHeight?: number;
}

/**
 * Blur that is strongest at the top of the screen and fades to nothing — what SwiftUI gets from
 * `.scrollEdgeEffectStyle(.soft, for: .top)`. Scroll content slides under the status bar without a
 * hard cut, and text stays legible against the clock and indicators.
 *
 * Place it as a sibling *after* the scroll view, inside a flex container. It never takes touches.
 *
 * Why not the native effect: UIKit's scroll-edge effect needs a navigation bar / toolbar to anchor
 * to. Tried via `scrollEdgeEffects: { top: 'soft' }` on a header-less screen on iOS 26.5 — no
 * visible effect. So this is drawn: a masked system blur (iOS 26 and older), and a plain
 * background-colour fade where there is no blur (Reduce Transparency; Android until its pass).
 */
export function ProgressiveBlur({ fadeHeight = 28 }: ProgressiveBlurProps) {
  const insets = useSafeAreaInsets();
  const mode = useSurfaceMode();
  const { colors } = useTheme();
  const height = insets.top + fadeHeight;

  const overlay = { position: 'absolute', top: 0, left: 0, right: 0, height } as const;

  if (mode === 'liquid' || mode === 'blur') {
    return (
      <View pointerEvents="none" style={overlay}>
        {/* Wide, soft blur… */}
        <MaskedView style={StyleSheet.absoluteFill} maskElement={<Fade height={height} color="#000" />}>
          <BlurView intensity={40} tint="systemThinMaterial" style={StyleSheet.absoluteFill} />
        </MaskedView>
        {/* …with a stronger one hugging the very top, so the status bar sits on a calm surface. */}
        <MaskedView style={[styles.top, { height: height * 0.6 }]} maskElement={<Fade height={height * 0.6} color="#000" />}>
          <BlurView intensity={80} tint="systemThinMaterial" style={StyleSheet.absoluteFill} />
        </MaskedView>
      </View>
    );
  }

  // No blur available/allowed: fade the content into the page background instead.
  return (
    <View pointerEvents="none" style={overlay}>
      <Fade height={height} color={colors.background} />
    </View>
  );
}

const styles = StyleSheet.create({
  top: { position: 'absolute', top: 0, left: 0, right: 0 },
});

import { BlurView } from 'expo-blur';
import { GlassView } from 'expo-glass-effect';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { GlassButton, Text, spacing, useTheme } from '../src/design-system';

/**
 * Dev-only experiment: does a native view (real `GlassView`) stay correct when a *JS-drawn* sheet
 * covers it? In Flutter, platform views could not be blurred / faded / clipped by Flutter widgets
 * above them. Here the sheet is an ordinary React Native view (not a native formSheet) in three
 * variants — blur, semi-transparent, solid — and the glass sits underneath it (or above, for
 * comparison).
 */
export default function GalleryOverlap() {
  if (!__DEV__) return <Redirect href="/" />;
  return <OverlapExperiment />;
}

type SheetVariant = 'blur' | 'semi' | 'solid';
type GlassLayer = 'under' | 'over';

const STRIPES = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#00C7BE', '#007AFF', '#AF52DE', '#FF2D55'];

function OverlapExperiment() {
  const router = useRouter();
  const { scheme, colors } = useTheme();
  const [variant, setVariant] = useState<SheetVariant>('blur');
  const [layer, setLayer] = useState<GlassLayer>('under');

  const glass = (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* Straddling the sheet's top edge, fully inside it, and tall enough to cross its mid-line. */}
      <GlassView glassEffectStyle="regular" colorScheme={scheme} style={[styles.glass, { top: '38%', left: 24, width: 150, height: 90 }]}>
        <Text variant="headline">Edge</Text>
      </GlassView>
      <GlassView glassEffectStyle="regular" colorScheme={scheme} style={[styles.glass, { top: '52%', right: 24, width: 170, height: 120 }]}>
        <Text variant="headline">Inside</Text>
      </GlassView>
      <GlassView
        glassEffectStyle="regular"
        tintColor="rgba(0,122,255,0.35)"
        colorScheme={scheme}
        style={[styles.glass, { top: '66%', left: 60, width: 200, height: 64, borderRadius: 32 }]}
      >
        <Text variant="headline">Tinted pill</Text>
      </GlassView>
      <GlassView glassEffectStyle="regular" colorScheme={scheme} style={[styles.glass, { top: '80%', right: 40, width: 80, height: 80, borderRadius: 40 }]}>
        <Text variant="headline">●</Text>
      </GlassView>
    </View>
  );

  return (
    <View style={styles.root}>
      {/* Busy backdrop so blur / transparency / glass refraction are all visible. */}
      <View style={StyleSheet.absoluteFill}>
        {STRIPES.map((c, i) => (
          <View key={c} style={{ flex: 1, backgroundColor: c, flexDirection: 'row' }}>
            <View style={{ flex: i % 2 ? 2 : 1, backgroundColor: STRIPES[(i + 3) % STRIPES.length] }} />
            <View style={{ flex: 1 }} />
          </View>
        ))}
        <Text variant="pageTitle" style={styles.backdropText}>
          Backdrop text — should blur / show through / be hidden
        </Text>
      </View>

      {layer === 'under' ? glass : null}

      {/* The JS-drawn sheet. */}
      <View style={[styles.sheet, variant === 'solid' && { backgroundColor: colors.surface }]}>
        {variant === 'blur' ? (
          <BlurView tint="systemThinMaterial" intensity={85} style={StyleSheet.absoluteFill} />
        ) : null}
        {variant === 'semi' ? (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: scheme === 'dark' ? 'rgba(28,28,30,0.5)' : 'rgba(255,255,255,0.5)' },
            ]}
          />
        ) : null}
        <View style={styles.grabber} />
        <Text variant="headline" style={styles.sheetTitle}>
          React sheet · {variant === 'semi' ? 'semi-transparent' : variant}
        </Text>
        <Text variant="subhead" color="textSecondary">
          Native glass is {layer === 'under' ? 'UNDER' : 'OVER'} this sheet.
        </Text>
      </View>

      {layer === 'over' ? glass : null}

      <View style={styles.controls}>
        <View style={styles.row}>
          {(['blur', 'semi', 'solid'] as const).map((v) => (
            <GlassButton key={v} label={v} size="compact" variant={variant === v ? 'prominent' : 'glass'} onPress={() => setVariant(v)} />
          ))}
        </View>
        <View style={styles.row}>
          {(['under', 'over'] as const).map((l) => (
            <GlassButton key={l} label={`glass ${l}`} size="compact" variant={layer === l ? 'prominent' : 'glass'} onPress={() => setLayer(l)} />
          ))}
          <GlassButton label="Close" size="compact" variant="plain" onPress={() => router.back()} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backdropText: { position: 'absolute', top: '45%', left: 16, right: 16, color: '#000' },
  glass: { position: 'absolute', borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '62%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderCurve: 'continuous',
    overflow: 'hidden',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  grabber: { alignSelf: 'center', width: 36, height: 5, borderRadius: 3, backgroundColor: 'rgba(128,128,128,0.6)', marginBottom: spacing.sm },
  sheetTitle: { marginTop: spacing.xs },
  controls: { position: 'absolute', top: 60, left: 0, right: 0, gap: spacing.sm, alignItems: 'center' },
  row: { flexDirection: 'row', gap: spacing.sm },
});

import { useEffect, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { radii } from '../tokens';
import { useTheme } from '../useTheme';
import { clamp } from './sliderMath';

export interface ProgressBarProps {
  /** 0–1. Omit for an indeterminate bar (work of unknown length). */
  value?: number;
  /** Accessible name ("Uploading photo"). */
  label: string;
  testID?: string;
}

const HEIGHT = 4;

/**
 * iOS's linear progress view: a thin capsule track with a rounded fill. Drawn once for both
 * platforms — it has no platform-specific behaviour worth a native control.
 */
export function ProgressBar({ value, label, testID }: ProgressBarProps) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const [width, setWidth] = useState(0);
  const fraction = useSharedValue(value === undefined ? 0 : clamp(value, 0, 1));
  const sweep = useSharedValue(0);
  const determinate = value !== undefined;

  useEffect(() => {
    if (value === undefined) return;
    fraction.set(withTiming(clamp(value, 0, 1), { duration: reduceMotion ? 0 : 240 }));
  }, [value, reduceMotion, fraction]);

  useEffect(() => {
    if (determinate) return;
    sweep.set(withRepeat(withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.cubic) }), -1, false));
    return () => cancelAnimation(sweep);
  }, [determinate, sweep]);

  const fillStyle = useAnimatedStyle(() => ({ width: fraction.get() * width }));
  const sweepStyle = useAnimatedStyle(() => {
    const segment = width * 0.35;
    return { width: segment, transform: [{ translateX: -segment + sweep.get() * (width + segment) }] };
  });

  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={determinate ? { min: 0, max: 100, now: Math.round(clamp(value, 0, 1) * 100) } : undefined}
      onLayout={(event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width)}
      style={[styles.track, { backgroundColor: colors.controlFill }]}
    >
      <Animated.View style={[styles.fill, { backgroundColor: colors.accent }, determinate ? fillStyle : sweepStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: HEIGHT, borderRadius: radii.pill, overflow: 'hidden', alignSelf: 'stretch' },
  fill: { height: HEIGHT, borderRadius: radii.pill },
});

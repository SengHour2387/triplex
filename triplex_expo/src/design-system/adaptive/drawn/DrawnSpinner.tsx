import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { useTheme } from '../../useTheme';
import type { SpinnerProps } from '../types';

const SPOKES = 12;
const SIZES = { small: 20, large: 36 } as const;
const CYCLE_MS = 960;
const MIN_OPACITY = 0.17;

/**
 * The iOS activity indicator, drawn: twelve rounded spokes, fading in a tail, advancing one spoke at
 * a time (the stock Android spinner is a Material arc). iOS uses the system one (`Spinner.ios.tsx`).
 */
export function DrawnSpinner({ size = 'small', color, label = 'Loading' }: SpinnerProps) {
  const { colors } = useTheme();
  const tint = color ?? colors.textSecondary;
  const box = SIZES[size];
  const spokeWidth = Math.max(2, box * 0.1);
  const spokeLength = box * 0.28;

  const turn = useSharedValue(0);
  useEffect(() => {
    turn.set(withRepeat(withTiming(1, { duration: CYCLE_MS, easing: Easing.steps(SPOKES, false) }), -1, false));
    return () => cancelAnimation(turn);
  }, [turn]);

  const spin = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.get() * 360}deg` }] }));

  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel={label} style={{ width: box, height: box }}>
      <Animated.View style={[{ width: box, height: box }, spin]}>
        {Array.from({ length: SPOKES }, (_, i) => (
          // Each spoke sits at the top, then is swung round the centre; the tail trails anticlockwise.
          <View key={i} style={[StyleSheet.absoluteFill, { transform: [{ rotate: `${-i * (360 / SPOKES)}deg` }] }]}>
            <View
              style={{
                alignSelf: 'center',
                width: spokeWidth,
                height: spokeLength,
                borderRadius: spokeWidth / 2,
                backgroundColor: tint,
                opacity: 1 - (i / (SPOKES - 1)) * (1 - MIN_OPACITY),
              }}
            />
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

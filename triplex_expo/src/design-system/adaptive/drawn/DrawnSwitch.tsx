import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { useTheme } from '../../useTheme';
import { haptic } from '../haptics';
import type { SwitchProps } from '../types';

export const SWITCH_TRACK = { width: 64, height: 28 } as const;
const THUMB_HEIGHT = 24;
const THUMB_WIDTH = 38;
const THUMB_WIDTH_PRESSED = 44;
const INSET = 2;
const SPRING = { damping: 18, stiffness: 260, mass: 0.7 } as const;

/**
 * The iOS 26 switch, drawn: a 64 × 28 track (system green when on) and a wide, white, soft-shadowed
 * knob that stretches under the finger. Used where there is no UISwitch — Android. iOS gets the
 * system control from `Switch.ios.tsx`.
 */
export function DrawnSwitch({ value, onValueChange, label, disabled = false, testID }: SwitchProps) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(value ? 1 : 0);
  const pressed = useSharedValue(0);

  useEffect(() => {
    const target = value ? 1 : 0;
    progress.set(reduceMotion ? target : withSpring(target, SPRING));
  }, [value, reduceMotion, progress]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.get(), [0, 1], [colors.toggleOff, colors.toggleOn]),
  }));

  const thumbStyle = useAnimatedStyle(() => {
    const width = THUMB_WIDTH + (THUMB_WIDTH_PRESSED - THUMB_WIDTH) * pressed.get();
    return {
      width,
      transform: [{ translateX: INSET + progress.get() * (SWITCH_TRACK.width - 2 * INSET - width) }],
    };
  });

  return (
    <Pressable
      testID={testID}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
      onPressIn={() => pressed.set(withTiming(1, { duration: reduceMotion ? 0 : 120 }))}
      onPressOut={() => pressed.set(withTiming(0, { duration: reduceMotion ? 0 : 160 }))}
      onPress={() => {
        haptic.selection();
        onValueChange(!value);
      }}
      style={{ opacity: disabled ? 0.4 : 1 }}
    >
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.thumb, { backgroundColor: colors.thumb }, thumbStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: { width: SWITCH_TRACK.width, height: SWITCH_TRACK.height, borderRadius: SWITCH_TRACK.height / 2, justifyContent: 'center' },
  thumb: {
    position: 'absolute',
    left: 0,
    height: THUMB_HEIGHT,
    borderRadius: THUMB_HEIGHT / 2,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
});

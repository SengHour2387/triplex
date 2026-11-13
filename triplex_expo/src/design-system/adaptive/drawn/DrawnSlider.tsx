import { useRef, useState } from 'react';
import { StyleSheet, View, type AccessibilityActionEvent, type GestureResponderEvent, type LayoutChangeEvent } from 'react-native';

import { useTheme } from '../../useTheme';
import { haptic } from '../haptics';
import { stepBy, thumbLeft, valueAt } from '../sliderMath';
import type { SliderProps } from '../types';

const HIT_HEIGHT = 44;
const TRACK_HEIGHT = 6;
const THUMB_WIDTH = 40;
const THUMB_HEIGHT = 26;

/**
 * The iOS 26 slider, drawn: a thin rounded track (accent up to the knob) and a white capsule knob.
 * Touching anywhere on the track moves the knob there, then it follows the finger. Used on Android;
 * iOS gets the system slider from `Slider.ios.tsx`.
 */
export function DrawnSlider({ value, onValueChange, onSlidingComplete, min = 0, max = 1, step, label, disabled = false, testID }: SliderProps) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const lastEmitted = useRef(value);

  const valueFor = (event: GestureResponderEvent) => valueAt(event.nativeEvent.locationX, width, THUMB_WIDTH, min, max, step);

  const emit = (event: GestureResponderEvent) => {
    const next = valueFor(event);
    if (next === lastEmitted.current) return;
    lastEmitted.current = next;
    if (step) haptic.selection();
    onValueChange(next);
  };

  const canDrag = () => !disabled && width > 0;

  const left = thumbLeft(value, width, THUMB_WIDTH, min, max);
  const a11yStep = step ?? (max - min) / 10;

  const onAccessibilityAction = (event: AccessibilityActionEvent) => {
    if (event.nativeEvent.actionName === 'increment') onValueChange(stepBy(value, a11yStep, min, max, step));
    if (event.nativeEvent.actionName === 'decrement') onValueChange(stepBy(value, -a11yStep, min, max, step));
  };

  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ min, max, now: value }}
      accessibilityState={{ disabled }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={onAccessibilityAction}
      onLayout={(event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width)}
      style={[styles.hit, { opacity: disabled ? 0.4 : 1 }]}
      onStartShouldSetResponder={canDrag}
      onMoveShouldSetResponder={canDrag}
      // A slider inside a ScrollView must keep the gesture once it has it.
      onResponderTerminationRequest={() => false}
      onResponderGrant={(event) => {
        lastEmitted.current = value;
        emit(event);
      }}
      onResponderMove={emit}
      onResponderRelease={(event) => onSlidingComplete?.(valueFor(event))}
    >
      {/* Children ignore touches so `locationX` is relative to this view, not to the knob. */}
      <View pointerEvents="none" style={[styles.track, { backgroundColor: colors.controlFill }]}>
        <View style={{ width: left + THUMB_WIDTH / 2, height: TRACK_HEIGHT, backgroundColor: colors.accent }} />
      </View>
      <View pointerEvents="none" style={[styles.thumb, { left, backgroundColor: colors.thumb }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  hit: { height: HIT_HEIGHT, justifyContent: 'center', alignSelf: 'stretch' },
  track: { height: TRACK_HEIGHT, borderRadius: TRACK_HEIGHT / 2, overflow: 'hidden' },
  thumb: {
    position: 'absolute',
    width: THUMB_WIDTH,
    height: THUMB_HEIGHT,
    borderRadius: THUMB_HEIGHT / 2,
    top: (HIT_HEIGHT - THUMB_HEIGHT) / 2,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
});

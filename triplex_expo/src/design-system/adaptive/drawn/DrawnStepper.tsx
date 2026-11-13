import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, View, type AccessibilityActionEvent } from 'react-native';

import { Icon } from '../../Icon';
import { useTheme } from '../../useTheme';
import { haptic } from '../haptics';
import { stepBy } from '../sliderMath';
import type { StepperProps } from '../types';

const WIDTH = 100;
const HEIGHT = 34;
const HOLD_DELAY_MS = 450;
const REPEAT_MS = 110;

/**
 * The iOS 26 stepper, drawn: a tinted capsule split by a hairline, "−" and "+". Tap steps once;
 * holding repeats, as UIStepper does. Used on Android; iOS gets `Stepper.ios.tsx`.
 */
export function DrawnStepper({ value, onValueChange, min = 0, max = 100, step = 1, label, disabled = false, testID }: StepperProps) {
  const { colors } = useTheme();
  const latest = useRef(value);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    latest.current = value;
  }, [value]);

  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };
  useEffect(() => stop, []);

  const apply = (delta: number) => {
    const next = stepBy(latest.current, delta, min, max, step);
    if (next === latest.current) return false;
    latest.current = next;
    haptic.selection();
    onValueChange(next);
    return true;
  };

  const startRepeating = (delta: number) => {
    stop();
    timer.current = setInterval(() => {
      if (!apply(delta)) stop(); // reached the limit
    }, REPEAT_MS);
  };

  const atMin = value <= min;
  const atMax = value >= max;

  const onAccessibilityAction = (event: AccessibilityActionEvent) => {
    if (event.nativeEvent.actionName === 'increment') apply(step);
    if (event.nativeEvent.actionName === 'decrement') apply(-step);
  };

  const button = (kind: 'minus' | 'plus') => {
    const delta = kind === 'plus' ? step : -step;
    const limited = kind === 'plus' ? atMax : atMin;
    return (
      <Pressable
        testID={testID ? `${testID}-${kind}` : undefined}
        accessibilityRole="button"
        accessibilityLabel={kind === 'plus' ? `Increase ${label}` : `Decrease ${label}`}
        accessibilityState={{ disabled: disabled || limited }}
        disabled={disabled || limited}
        delayLongPress={HOLD_DELAY_MS}
        onPress={() => apply(delta)}
        onLongPress={() => startRepeating(delta)}
        onPressOut={stop}
        style={({ pressed }) => [styles.half, pressed && { backgroundColor: colors.controlFill }]}
      >
        <Icon name={kind} size={16} color={limited ? colors.textSecondary : colors.text} />
      </Pressable>
    );
  };

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ min, max, now: value }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={onAccessibilityAction}
      style={[styles.capsule, { backgroundColor: colors.controlFill, opacity: disabled ? 0.4 : 1 }]}
    >
      {button('minus')}
      <View style={[styles.divider, { backgroundColor: colors.separator }]} />
      {button('plus')}
    </View>
  );
}

const styles = StyleSheet.create({
  capsule: { width: WIDTH, height: HEIGHT, borderRadius: HEIGHT / 2, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  half: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center' },
  divider: { width: StyleSheet.hairlineWidth * 2, height: 16 },
});

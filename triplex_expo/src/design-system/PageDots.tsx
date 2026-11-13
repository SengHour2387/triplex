import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

import { useTheme } from './useTheme';

export interface PageDotsProps {
  count: number;
  /** Zero-based index of the current page. */
  index: number;
}

const DOT = 6;
const ACTIVE_WIDTH = 18;

function Dot({ active, color, activeColor }: { active: boolean; color: string; activeColor: string }) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(active ? 1 : 0);
  useEffect(() => {
    progress.set(withTiming(active ? 1 : 0, { duration: reduceMotion ? 0 : 220 }));
  }, [active, progress, reduceMotion]);
  const style = useAnimatedStyle(() => ({ width: DOT + (ACTIVE_WIDTH - DOT) * progress.get() }));
  return <Animated.View style={[styles.dot, { backgroundColor: active ? activeColor : color }, style]} />;
}

/** Page indicator for a carousel: the current page stretches into a pill (Flutter's media dots). */
export function PageDots({ count, index }: PageDotsProps) {
  const { colors } = useTheme();
  if (count < 2) return null;
  return (
    <View style={styles.row} accessible accessibilityRole="adjustable" accessibilityLabel={`Page ${index + 1} of ${count}`}>
      {Array.from({ length: count }, (_, i) => (
        <Dot key={i} active={i === index} color={colors.separator} activeColor={colors.text} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  dot: { height: DOT, borderRadius: DOT / 2 },
});

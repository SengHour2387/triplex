import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

// Springs, not a timing curve: a linear-feeling ramp reads as mechanical. Damping ratio just under 1
// gives a soft landing with only a hair of overshoot; closing is critically damped (no undershoot).
const OPEN_SPRING = { dampingRatio: 0.85, duration: 520 } as const;
const CLOSE_SPRING = { dampingRatio: 1, duration: 360, overshootClamping: true } as const;
const EPS = 0.001;
const NO_CAP = 100000;

export interface ExpandRevealProps {
  open: boolean;
  children: ReactNode;
}

/**
 * Reveals `children` the way an accordion should feel on iOS 26: the box grows from its top edge
 * downward while the content fades in. Closing runs it in reverse, then collapses to nothing.
 *
 * Reduce Motion → no animation (content appears/disappears).
 *
 * No blur layer: a frosted box the size of the reveal read as a white "ghost" container around the
 * replies. Don't add one back without solving that.
 */
export function ExpandReveal({ open, children }: ExpandRevealProps) {
  const reduceMotion = useReducedMotion();

  const progress = useSharedValue(open ? 1 : 0);
  const isOpen = useSharedValue(open ? 1 : 0);
  const contentHeight = useSharedValue(0);

  // No React state decides whether the content exists: it stays mounted and the shared values below
  // collapse it. (A mounted/unmounted state flag got stuck on `false` on device and hid the replies.)
  useEffect(() => {
    isOpen.set(open ? 1 : 0);
    if (reduceMotion) {
      progress.set(open ? 1 : 0);
    } else if (open) {
      progress.set(withSpring(1, OPEN_SPRING));
    } else {
      progress.set(withSpring(0, CLOSE_SPRING));
    }
  }, [open, reduceMotion, progress, isOpen]);

  // Animate `maxHeight`, never `height: 'auto'` — an animated 'auto' collapsed the box to 0 on device.
  // Closed at rest → 0. Between 0 and 1 → a number. Fully open (or opening, before it is measured) →
  // a cap far above any real content, so the box sizes to its children and late-arriving replies
  // can never be clipped.
  const boxStyle = useAnimatedStyle(() => {
    const p = progress.value;
    if (p <= EPS && isOpen.value === 0) return { maxHeight: 0 };
    const animating = p > EPS && p < 1 && contentHeight.value > 0;
    return { maxHeight: animating ? contentHeight.value * p : NO_CAP };
  });

  const fadeStyle = useAnimatedStyle(() => ({ opacity: Math.min(1, Math.max(0, progress.value)) }));

  const onLayout = (e: LayoutChangeEvent) => contentHeight.set(e.nativeEvent.layout.height);

  return (
    <Animated.View
      style={[styles.box, boxStyle]}
      accessibilityElementsHidden={!open}
      importantForAccessibility={open ? 'auto' : 'no-hide-descendants'}
      pointerEvents={open ? 'auto' : 'none'}
    >
      {/* In normal flow, so it keeps its natural height inside the shorter, clipping box. */}
      <Animated.View style={fadeStyle}>
        <View onLayout={onLayout}>{children}</View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  box: { overflow: 'hidden' },
});

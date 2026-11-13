import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedKeyboard,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FullWindowOverlay } from 'react-native-screens';

import { Icon } from './Icon';
import { Text } from './Text';
import { toast, toastDisplayMs, useToastStore, type ToastMessage } from './toastStore';
import { spacing } from './tokens';
import { useTheme } from './useTheme';

// Animation timing is Flutter's (`toast_overlay.dart`): 320 ms in/out. Time on screen: `toastDisplayMs`.
const ANIM_MS = 320;
const SLIDE_PX = 32;

/**
 * Mount once, near the root. Shows one toast at a time (a new one replaces the current), floats
 * above the keyboard and the home indicator, auto-dismisses, and announces itself to VoiceOver.
 *
 * On iOS it renders inside a `FullWindowOverlay` — a separate native window above everything —
 * because a native sheet / modal is presented *over* the app's root view and would otherwise cover
 * the toast (verified: a toast raised from a sheet was hidden behind its glass). Elsewhere it is an
 * ordinary overlay.
 */
export function ToastHost() {
  const current = useToastStore((s) => s.current);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const keyboard = useAnimatedKeyboard();
  const reduceMotion = useReducedMotion();
  const duration = reduceMotion ? 0 : ANIM_MS;

  const [shown, setShown] = useState<ToastMessage | null>(null);
  const shownRef = useRef<ToastMessage | null>(null);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!current) {
      // Dismissed (manually, by timer, or by the app): animate out, then unmount.
      if (!shownRef.current) return;
      progress.set(withTiming(0, { duration }));
      const unmount = setTimeout(() => {
        shownRef.current = null;
        setShown(null);
      }, duration);
      return () => clearTimeout(unmount);
    }

    // A new toast: if one is on screen, let it leave first.
    const wait = shownRef.current ? duration : 0;
    if (wait) progress.set(withTiming(0, { duration }));

    const enter = setTimeout(() => {
      shownRef.current = current;
      setShown(current);
      progress.set(withTiming(1, { duration, easing: Easing.out(Easing.cubic) }));
      AccessibilityInfo.announceForAccessibility(current.message);
    }, wait);
    const expire = setTimeout(() => toast.dismiss(), wait + duration + toastDisplayMs(current));

    return () => {
      clearTimeout(enter);
      clearTimeout(expire);
    };
  }, [current, duration, progress]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.get(),
    transform: [{ translateY: (1 - progress.get()) * SLIDE_PX }],
    bottom: keyboard.height.get() + insets.bottom + spacing.lg,
  }));

  if (!shown) return null;

  const { bg, fg } = colors.toast[shown.kind];

  const toastView = (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View
        key={shown.id}
        style={[styles.card, { backgroundColor: bg }, cardStyle]}
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
      >
        <Icon name={shown.kind} size={22} color={fg} />
        <Text variant="subhead" weight="500" style={[styles.message, { color: fg }]}>
          {shown.message}
        </Text>

        {shown.actionLabel ? (
          <Pressable
            accessibilityRole="button"
            hitSlop={10}
            onPress={() => {
              // Dismiss *first*: an action that raises its own toast ("Retrying…") must not be
              // wiped by a dismiss that runs after it.
              toast.dismiss();
              shown.onAction?.();
            }}
          >
            <Text variant="footnote" weight="700" style={{ color: fg, textDecorationLine: 'underline' }}>
              {shown.actionLabel}
            </Text>
          </Pressable>
        ) : null}

        <Pressable accessibilityRole="button" accessibilityLabel="Dismiss" hitSlop={14} onPress={toast.dismiss}>
          <Icon name="close" size={16} color={fg} />
        </Pressable>
      </Animated.View>
    </View>
  );

  return Platform.OS === 'ios' ? <FullWindowOverlay>{toastView}</FullWindowOverlay> : toastView;
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderRadius: 24,
    borderCurve: 'continuous',
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
  },
  message: { flex: 1 },
});

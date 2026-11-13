import { useCallback, useEffect, useRef, useState } from 'react';
import { Easing, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

const ENTER_MS = 220;
const EXIT_MS = 150;

/**
 * Shared enter / exit choreography of the drawn dialogs: `progress` runs 0 → 1 on mount; `close()`
 * runs it back to 0 and only then calls `onClosed` — so a tapped button's action fires *after* the
 * dialog has left, as it does on iOS. Reduce Motion skips the animation.
 */
export function useDialogTransition(onClosed: () => void) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);
  const [closing, setClosing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    progress.set(withTiming(1, { duration: reduceMotion ? 0 : ENTER_MS, easing: Easing.out(Easing.cubic) }));
  }, [reduceMotion, progress]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const close = useCallback(
    (then?: () => void) => {
      if (closing) return;
      setClosing(true);
      const duration = reduceMotion ? 0 : EXIT_MS;
      progress.set(withTiming(0, { duration, easing: Easing.in(Easing.cubic) }));
      timer.current = setTimeout(() => {
        onClosed();
        then?.();
      }, duration);
    },
    [closing, reduceMotion, progress, onClosed],
  );

  return { progress, close, closing };
}

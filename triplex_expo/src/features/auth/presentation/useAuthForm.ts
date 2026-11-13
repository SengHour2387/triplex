import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';

import { type FieldErrors, hasErrors } from '../validation/rules';
import { useAuthStore } from '../store/authStore';

/**
 * Form plumbing shared by login/register: field values, inline errors that clear as the user edits,
 * a double-submit guard, and an error haptic whenever a submit is rejected (locally or by the server).
 */
export function useAuthForm<V extends Record<string, string>>({
  initial,
  validate,
  submit,
}: {
  initial: V;
  validate: (values: V) => FieldErrors<keyof V & string>;
  submit: (values: V) => Promise<unknown>;
}) {
  const [values, setValues] = useState<V>(initial);
  // The latest values, updated synchronously. A submit can fire in the same tick as the last keystroke
  // (autofill, a fast Return) — before React has re-rendered — so `values` from render may be stale.
  const latest = useRef<V>(initial);
  const [errors, setErrors] = useState<FieldErrors<keyof V & string>>({});
  const isLoading = useAuthStore((s) => s.isLoading);
  const serverError = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  // `isLoading` is a render-time snapshot: two taps in the same frame both see `false`. A ref closes that gap.
  const inFlight = useRef(false);

  // A stale "session expired" / previous-screen error shouldn't greet a fresh form… except that the
  // expiry message is exactly what login should show, so only clear on *edit*, not on mount.
  useEffect(() => () => clearError(), [clearError]);

  const setField = useCallback(
    (field: keyof V & string, value: string) => {
      latest.current = { ...latest.current, [field]: value };
      setValues(latest.current);
      setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
      clearError();
    },
    [clearError],
  );

  const onSubmit = useCallback(async () => {
    if (isLoading || inFlight.current) return;
    const current = latest.current;
    const found = validate(current);
    setErrors(found);
    if (hasErrors(found)) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    inFlight.current = true;
    try {
      await submit(current);
    } catch {
      // The store already holds the user-safe message (`serverError`); just tell the hands.
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      inFlight.current = false;
    }
  }, [isLoading, validate, submit]);

  return { values, errors, setField, onSubmit, isLoading, serverError };
}

import * as Haptics from 'expo-haptics';

/**
 * Light feedback for drawn controls. iOS's native controls already tick on their own, so only the
 * drawn (Android) versions call this. Never throws: a device without a vibrator just gets no tick.
 */
export const haptic = {
  selection: () => {
    void Haptics.selectionAsync().catch(() => undefined);
  },
  light: () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
  },
};

import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Glass } from '../../Glass';
import { Text } from '../../Text';
import { radii, spacing } from '../../tokens';
import { useTheme } from '../../useTheme';
import type { SheetRequest } from '../dialogStore';
import type { DialogAction } from '../types';
import { useDialogTransition } from './useDialogTransition';

const BUTTON_HEIGHT = 50;
const SLIDE = 520;

/**
 * The iOS 26 action sheet, drawn: one floating glass card with a left-aligned title and message and the
 * choices as stacked capsule buttons — Cancel is simply the last capsule, destructive is red. Tapping
 * outside or the system Back gesture cancels. iOS presents the system sheet (`present.ios.ts`).
 */
export function DrawnActionSheet({ request, onDismiss }: { request: SheetRequest; onDismiss: () => void }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { progress, close } = useDialogTransition(onDismiss);
  const { title, message, actions, cancel } = request;

  const scrim = useAnimatedStyle(() => ({ opacity: progress.get() }));
  const sheet = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - progress.get()) * SLIDE }] }));

  return (
    <Modal transparent animationType="none" statusBarTranslucent navigationBarTranslucent onRequestClose={() => close(cancel.onPress)}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }, scrim]}>
        <Pressable accessibilityLabel={cancel.label} accessibilityRole="button" style={StyleSheet.absoluteFill} onPress={() => close(cancel.onPress)} />
      </Animated.View>

      <View style={styles.bottom} pointerEvents="box-none">
        <Animated.View accessibilityViewIsModal style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.sm) + spacing.sm }, sheet]}>
          <Glass opaque radius="xxl" style={styles.card}>
            {title || message ? (
              <View style={styles.header}>
                {title ? <Text variant="headline">{title}</Text> : null}
                {message ? (
                  <Text variant="subhead" color="textSecondary">
                    {message}
                  </Text>
                ) : null}
              </View>
            ) : null}
            <View style={styles.buttons}>
              {actions.map((action, index) => (
                <SheetButton key={`${action.label}-${index}`} action={action} onPress={() => close(action.onPress)} />
              ))}
              <SheetButton action={cancel} onPress={() => close(cancel.onPress)} />
            </View>
          </Glass>
        </Animated.View>
      </View>
    </Modal>
  );
}

function SheetButton({ action, onPress }: { action: DialogAction; onPress: () => void }) {
  const { colors } = useTheme();
  const color = action.style === 'destructive' ? colors.destructive : colors.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={action.label}
      onPress={onPress}
      style={({ pressed }) => [styles.button, { backgroundColor: colors.buttonFill, opacity: pressed ? 0.7 : 1 }]}
    >
      <Text variant="headline" weight="400" numberOfLines={1} style={{ color }}>
        {action.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bottom: { flex: 1, justifyContent: 'flex-end' },
  sheet: { paddingHorizontal: spacing.md },
  card: { padding: spacing.lg, gap: spacing.lg },
  header: { gap: spacing.xs, paddingHorizontal: spacing.sm, paddingTop: spacing.xs },
  buttons: { gap: spacing.sm },
  button: { minHeight: BUTTON_HEIGHT, borderRadius: radii.pill, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
});

import { Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { Glass } from '../../Glass';
import { Text } from '../../Text';
import { radii, spacing } from '../../tokens';
import { useTheme } from '../../useTheme';
import type { AlertRequest } from '../dialogStore';
import type { DialogAction } from '../types';
import { useDialogTransition } from './useDialogTransition';

const MAX_WIDTH = 320;
const BUTTON_HEIGHT = 50;

/**
 * The iOS 26 alert, drawn: a large-radius glass card with a left-aligned title and message, and capsule
 * buttons — side by side for two actions, stacked for more. Buttons are quiet grey capsules; Cancel is
 * regular weight, destructive is red, and only a `preferred` action is solid (as the system's is bold).
 */
export function DrawnAlertDialog({ request, onDismiss }: { request: AlertRequest; onDismiss: () => void }) {
  const { colors } = useTheme();
  const window = useWindowDimensions();
  const { progress, close } = useDialogTransition(onDismiss);

  const { title, message, actions } = request;
  const stacked = actions.length > 2;
  const cancel = actions.find((a) => a.style === 'cancel');
  const width = Math.min(MAX_WIDTH, window.width - 2 * spacing.xl);

  const scrim = useAnimatedStyle(() => ({ opacity: progress.get() }));
  const card = useAnimatedStyle(() => ({ opacity: progress.get(), transform: [{ scale: 1.08 - 0.08 * progress.get() }] }));

  return (
    <Modal transparent animationType="none" statusBarTranslucent navigationBarTranslucent onRequestClose={() => cancel && close(cancel.onPress)}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }, scrim]} />
      <View style={styles.center} pointerEvents="box-none">
        <Animated.View accessibilityViewIsModal accessibilityRole="alert" style={[styles.shadow, { width, backgroundColor: colors.surface }, card]}>
          <Glass opaque radius="xxl" style={styles.card}>
            <View style={styles.copy}>
              <Text variant="headline">{title}</Text>
              {message ? (
                <Text variant="subhead" color="textSecondary">
                  {message}
                </Text>
              ) : null}
            </View>

            <View style={[styles.actions, stacked ? styles.column : styles.row]}>
              {actions.map((action, index) => (
                <DialogButton key={`${action.label}-${index}`} action={action} onPress={() => close(action.onPress)} />
              ))}
            </View>
          </Glass>
        </Animated.View>
      </View>
    </Modal>
  );
}

function DialogButton({ action, onPress }: { action: DialogAction; onPress: () => void }) {
  const { colors } = useTheme();
  const destructive = action.style === 'destructive';
  const solid = action.preferred === true;
  const background = solid ? colors.primary : colors.buttonFill;
  const label = solid ? colors.onPrimary : destructive ? colors.destructive : colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={action.label}
      onPress={onPress}
      style={({ pressed }) => [styles.button, { backgroundColor: background, opacity: pressed ? 0.7 : 1 }]}
    >
      <Text variant="headline" weight={action.style === 'cancel' ? '400' : '600'} numberOfLines={2} style={[styles.centred, { color: label }]}>
        {action.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  shadow: {
    borderRadius: radii.xxl,
    borderCurve: 'continuous',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 16,
  },
  card: { padding: spacing.lg, paddingTop: spacing.xl, gap: spacing.xl },
  copy: { gap: spacing.xs, paddingHorizontal: spacing.sm },
  centred: { textAlign: 'center' },
  actions: { gap: spacing.sm },
  row: { flexDirection: 'row' },
  column: { flexDirection: 'column' },
  button: { flex: 1, minHeight: BUTTON_HEIGHT, borderRadius: radii.pill, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
});

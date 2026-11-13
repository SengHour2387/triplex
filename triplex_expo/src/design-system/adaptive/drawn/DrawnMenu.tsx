import { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Glass } from '../../Glass';
import { Icon } from '../../Icon';
import { Text } from '../../Text';
import { radii, spacing } from '../../tokens';
import { useTheme } from '../../useTheme';
import { haptic } from '../haptics';
import { placeMenu, type Placement, type Rect } from '../menuPlacement';
import type { MenuEntry, MenuItem, MenuProps } from '../types';
import { GlassIconButton } from './GlassIconButton';

const MENU_WIDTH = 250;
const ROW_HEIGHT = 48;
const DIVIDER_HEIGHT = 9;
const PAD = 8;

/** Height the menu will have — used to decide whether it fits below its button, before it is drawn. */
export function menuHeight(items: readonly MenuEntry[]): number {
  return PAD * 2 + items.reduce((sum, entry) => sum + (entry === 'divider' ? DIVIDER_HEIGHT : ROW_HEIGHT), 0);
}

/**
 * The iOS 26 pull-down menu, drawn: a circular glass button that opens a rounded glass card, unfolding
 * from the button. As in iOS 26 the icon (or, for the selected option, a check mark) leads the label,
 * groups are split by a thin inset rule, and destructive rows are red. Used on Android; iOS gets a real `Menu` from `Menu.ios.tsx`.
 */
export function DrawnMenu({ label, items, icon = 'more', disabled = false, bare = false, testID }: MenuProps & { bare?: boolean }) {
  const [anchor, setAnchor] = useState<Rect | null>(null);
  const triggerRef = useRef<View>(null);

  const open = () => {
    haptic.light();
    triggerRef.current?.measureInWindow?.((x, y, width, height) => setAnchor({ x, y, width, height }));
  };
  const close = useCallback(() => setAnchor(null), []);

  return (
    <>
      <GlassIconButton ref={triggerRef} label={label} onPress={open} disabled={disabled} testID={testID} bare={bare}>
        <Icon name={icon} size={20} />
      </GlassIconButton>
      {anchor ? <MenuPopover anchor={anchor} items={items} onClose={close} /> : null}
    </>
  );
}

function MenuPopover({ anchor, items, onClose }: { anchor: Rect; items: readonly MenuEntry[]; onClose: () => void }) {
  const { colors } = useTheme();
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const width = Math.min(MENU_WIDTH, window.width - 2 * spacing.lg);
  const placement: Placement = placeMenu({ anchor, menu: { width, height: menuHeight(items) }, window, insets });
  // iOS 26 keeps one leading column for icons / check marks, so labels stay aligned.
  const hasLeading = items.some((entry) => entry !== 'divider' && (entry.icon || entry.selected));

  const progress = useSharedValue(reduceMotion ? 1 : 0);
  useEffect(() => {
    if (!reduceMotion) progress.set(withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic) }));
  }, [reduceMotion, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.get(),
    transform: [{ scale: 0.82 + 0.18 * progress.get() }],
  }));

  const choose = (item: MenuItem) => {
    haptic.selection();
    onClose();
    item.onPress();
  };

  return (
    <Modal transparent animationType="none" statusBarTranslucent navigationBarTranslucent onRequestClose={onClose}>
      <Pressable accessibilityLabel="Close menu" style={StyleSheet.absoluteFill} onPress={onClose} />
      <Animated.View
        accessibilityViewIsModal
        style={[
          styles.shadow,
          { left: placement.left, top: placement.top, width, backgroundColor: colors.surface, transformOrigin: placement.origin },
          style,
        ]}
      >
        <Glass opaque radius="xl" style={styles.card}>
          {items.map((entry, index) =>
            entry === 'divider' ? (
              <View key={`divider-${index}`} style={styles.divider}>
                <View style={[styles.rule, { backgroundColor: colors.separator }]} />
              </View>
            ) : (
              <Pressable
                key={`${entry.label}-${index}`}
                accessibilityRole="menuitem"
                accessibilityLabel={entry.label}
                accessibilityState={{ disabled: entry.disabled, selected: entry.selected }}
                disabled={entry.disabled}
                onPress={() => choose(entry)}
                style={({ pressed }) => [styles.row, { opacity: entry.disabled ? 0.4 : 1 }, pressed && { backgroundColor: colors.controlFill }]}
              >
                {hasLeading ? (
                  <View style={styles.leading}>
                    {entry.selected ? (
                      <Icon name="check" size={18} />
                    ) : entry.icon ? (
                      <Icon name={entry.icon} size={20} color={entry.destructive ? colors.destructive : colors.text} />
                    ) : null}
                  </View>
                ) : null}
                <Text variant="body" style={[styles.label, entry.destructive && { color: colors.destructive }]} numberOfLines={1}>
                  {entry.label}
                </Text>
              </Pressable>
            ),
          )}
        </Glass>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  shadow: {
    position: 'absolute',
    borderRadius: radii.xl,
    borderCurve: 'continuous',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 14,
  },
  card: { paddingVertical: PAD },
  row: { height: ROW_HEIGHT, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg },
  label: { flex: 1 },
  leading: { width: 24, alignItems: 'center' },
  divider: { height: DIVIDER_HEIGHT, justifyContent: 'center', paddingHorizontal: spacing.lg },
  rule: { height: StyleSheet.hairlineWidth },
});

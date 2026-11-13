import { MaterialIcons } from '@expo/vector-icons';
import { BottomTabBarHeightCallbackContext, type BottomTabBarProps } from 'expo-router/js-tabs';
import { useContext, useEffect, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Glass } from '../../Glass';
import { Text } from '../../Text';
import { radii, spacing } from '../../tokens';
import { useTheme } from '../../useTheme';
import { haptic } from '../haptics';
import type { AppTab } from '../types';

const BAR_PADDING = 6;
const ITEM_HEIGHT = 54;
const ITEM_WIDTH = 92;
/** From three tabs up, iOS 26's bar spans (nearly) the screen; with fewer it hugs its tabs. */
const SPANS_SCREEN_FROM = 3;

function useKeyboardVisible(): boolean {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return visible;
}

/**
 * The iOS 26 tab bar, drawn: a floating glass capsule above the gesture bar, each tab an icon over a
 * small label, the selected one on a soft inner capsule in the primary colour. Floats over the content
 * (screens pad for it through the tab-bar-height context). Hides while the keyboard is open. iOS uses
 * the system tab bar (`AppTabs.ios.tsx`).
 */
export function DrawnTabBar({ state, navigation, tabs }: BottomTabBarProps & { tabs: readonly AppTab[] }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const reportHeight = useContext(BottomTabBarHeightCallbackContext);
  const keyboardVisible = useKeyboardVisible();

  if (keyboardVisible) return null;
  const spans = tabs.length >= SPANS_SCREEN_FROM;

  return (
    <View
      pointerEvents="box-none"
      onLayout={(event) => reportHeight?.(event.nativeEvent.layout.height)}
      style={[styles.wrap, { paddingBottom: insets.bottom + spacing.sm }]}
    >
      <View style={[styles.shadow, { backgroundColor: colors.surface }, !spans && styles.hug]}>
        <Glass opaque radius="pill" accessibilityRole="tablist" style={styles.bar}>
          {state.routes.map((route, index) => {
            const tab = tabs.find((t) => t.name === route.name);
            if (!tab) return null;
            const focused = state.index === index;
            const tint = focused ? colors.primary : colors.textSecondary;

            const press = () => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) {
                haptic.selection();
                navigation.navigate(route.name, route.params);
              }
            };

            return (
              <Pressable
                key={route.key}
                accessibilityRole="tab"
                accessibilityLabel={tab.badge === undefined ? tab.label : `${tab.label}, ${tab.badge}`}
                accessibilityState={{ selected: focused }}
                onPress={press}
                onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
                style={spans ? styles.tab : { width: ITEM_WIDTH }}
              >
                <View style={[styles.item, focused && { backgroundColor: colors.controlFill }]}>
                  <View>
                    <MaterialIcons name={focused ? (tab.icon.mdSelected ?? tab.icon.md) : tab.icon.md} size={24} color={tint} />
                    {tab.badge !== undefined ? (
                      <View style={[styles.badge, { backgroundColor: colors.destructive }]}>
                        <Text variant="caption" weight="700" style={{ color: colors.onPrimary }}>
                          {String(tab.badge)}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <Text variant="caption" weight="500" numberOfLines={1} style={{ color: tint }}>
                    {tab.label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </Glass>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: spacing.xl },
  shadow: {
    borderRadius: radii.pill,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  hug: { alignSelf: 'center' },
  bar: { flexDirection: 'row', padding: BAR_PADDING },
  tab: { flex: 1 },
  item: { height: ITEM_HEIGHT, borderRadius: radii.pill, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center', gap: 2 },
  badge: { position: 'absolute', top: -4, right: -12, minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center' },
});

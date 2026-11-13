import { Platform, ScrollView, StyleSheet, View, type RefreshControlProps, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing } from './tokens';
import { useTabBarInset } from './useTabBarInset';
import { useTheme } from './useTheme';

export interface ScreenProps {
  children?: React.ReactNode;
  /** Scrolls. Also lifts content above the keyboard unless `keyboardInsets` is turned off. */
  scroll?: boolean;
  /**
   * Lift the content above the keyboard (iOS adjusts the scroll view's insets natively). Defaults on.
   * Turn it OFF on screens that have no text input: a screen kept mounted *underneath* another one
   * still reacts to that screen's keyboard, and was left scrolled after the keyboard closed (found
   * on device: Settings, after editing in Account Center).
   */
  keyboardInsets?: boolean;
  /**
   * The screen sits under a navigation header (iOS: the native, transparent one; Android: the drawn
   * `AppHeader`, which is in the layout flow). The header already accounts for the status bar, so the
   * screen must not pad for it again. Leave off on screens with no header (login, the gallery).
   */
  underHeader?: boolean;
  /** Horizontal padding. Defaults to on. */
  padded?: boolean;
  /**
   * Apply the top safe-area inset. Turn off under a native header, which already accounts for it.
   * Only affects the non-scrolling variant: a scrolling screen's insets are applied by UIKit (below).
   */
  topInset?: boolean;
  /** Pull-to-refresh (scrolling screens only). Pass a `<RefreshControl>`. */
  refreshControl?: React.ReactElement<RefreshControlProps>;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

/**
 * Padding a scrolling screen needs from *us* because the OS does not provide it.
 *
 *  - **iOS:** none. UIKit insets the scroll view itself (`contentInsetAdjustmentBehavior`), and padding
 *    it as well double-counts (found on device: content a whole status bar too low).
 *  - **Android:** the window is edge to edge (content may scroll under the status bar and gesture bar),
 *    but a `ScrollView` is not inset for them. At the top, a screen under the drawn header needs nothing
 *    (the header, in the layout flow, already clears the status bar); one without a header clears the
 *    status bar itself. At the bottom it clears the gesture bar — or, inside tabs, the whole floating
 *    tab bar (`tabBarInset`, which already includes the gesture bar). Padding the *content container*
 *    (not the view) keeps the edge-to-edge scrolling: content still slides under the system bars.
 */
export function scrollPadding(os: string, insets: { top: number; bottom: number }, underHeader: boolean, tabBarInset = 0) {
  if (os !== 'android') return { top: 0, bottom: 0 };
  return { top: underHeader ? 0 : insets.top, bottom: tabBarInset > 0 ? tabBarInset : insets.bottom };
}

/**
 * `scrollPadding` for the current device and screen — for a hand-built `ScrollView` (e.g. the feed,
 * which must be the screen's first child for native tabs). Add the result to its content container.
 */
export function useScrollInsets(underHeader = false) {
  const insets = useSafeAreaInsets();
  const tabBarInset = useTabBarInset();
  return scrollPadding(Platform.OS, insets, underHeader, tabBarInset);
}

/**
 * Themed page container: background, safe areas, and keyboard behaviour.
 *
 * Safe areas are handled differently on purpose:
 *  - **non-scrolling**: padded by hand from `useSafeAreaInsets()`.
 *  - **scrolling**: left to UIKit (`contentInsetAdjustmentBehavior="automatic"`) and *not* padded by
 *    hand. Measured on iOS 26.5 inside native tabs: UIKit already applies the top inset to a scroll
 *    view there, so padding it as well put the content a whole status bar too low. `automatic` also
 *    reserves the floating tab bar at the bottom, which `useSafeAreaInsets()` alone does not give a
 *    scroll view's content.
 */
export function Screen({ children, scroll = false, padded = true, topInset = true, keyboardInsets = true, underHeader = false, refreshControl, style, contentStyle }: ScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarInset = useTabBarInset();
  const horizontal = padded ? spacing.lg : 0;

  if (scroll) {
    const extra = scrollPadding(Platform.OS, insets, underHeader, tabBarInset);
    return (
      <ScrollView
        style={[styles.fill, { backgroundColor: colors.background }, style]}
        contentContainerStyle={[styles.grow, { paddingHorizontal: horizontal, paddingTop: extra.top, paddingBottom: spacing.lg + extra.bottom }, contentStyle]}
        contentInsetAdjustmentBehavior="automatic"
        automaticallyAdjustKeyboardInsets={keyboardInsets}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View
      style={[
        styles.fill,
        { backgroundColor: colors.background },
        { paddingTop: topInset ? insets.top : 0, paddingBottom: tabBarInset > 0 ? tabBarInset : insets.bottom, paddingHorizontal: horizontal },
        style,
        contentStyle,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  grow: { flexGrow: 1 },
});

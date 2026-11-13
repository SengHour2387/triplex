import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '../Icon';
import { Text } from '../Text';
import { spacing } from '../tokens';
import { useTheme } from '../useTheme';
import { GlassIconButton, ICON_BUTTON_SIZE } from './drawn/GlassIconButton';

/** Height of the bar row (the 44 pt glass buttons plus breathing room). */
export const APP_HEADER_BAR_HEIGHT = 56;
const SIDE_WIDTH = 2 * ICON_BUTTON_SIZE + spacing.sm;

/**
 * The slice of the navigator's header props this header uses (kept structural so this file does not
 * depend on the router's internal types).
 */
export interface AppHeaderProps {
  options: {
    title?: string;
    headerLargeTitle?: boolean;
    headerBackVisible?: boolean;
    headerLeft?: (props: { canGoBack: boolean; tintColor?: string }) => React.ReactNode;
    headerRight?: (props: { canGoBack: boolean; tintColor?: string }) => React.ReactNode;
  };
  route: { name: string };
  back?: unknown;
  navigation: { goBack: () => void };
}

/**
 * The iOS 26 navigation bar, drawn for Android: a circular glass back button on the left, the title
 * centred (or, for a large-title screen, set big below the bar), and glass action buttons on the right
 * (supplied by `Toolbar`). Sits in the layout flow — content starts below it. Opaque canvas colour, so
 * scrolled content slides cleanly behind it. iOS uses the native header and never renders this.
 */
export function AppHeader({ options, route, back, navigation }: AppHeaderProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const title = options.title ?? route.name;
  const canGoBack = Boolean(back);
  const largeTitle = options.headerLargeTitle === true;
  const showBack = canGoBack && options.headerBackVisible !== false;

  const left =
    options.headerLeft?.({ canGoBack, tintColor: colors.text }) ??
    (showBack ? (
      <GlassIconButton label="Back" onPress={navigation.goBack}>
        <Icon name="chevronLeft" size={20} />
      </GlassIconButton>
    ) : null);
  const right = options.headerRight?.({ canGoBack, tintColor: colors.text }) ?? null;

  return (
    <View style={{ backgroundColor: colors.background, paddingTop: insets.top }}>
      <View style={styles.bar}>
        <View style={styles.side}>{left}</View>
        {largeTitle ? (
          <View style={styles.flex} />
        ) : (
          <Text variant="headline" accessibilityRole="header" numberOfLines={1} style={styles.title}>
            {title}
          </Text>
        )}
        <View style={[styles.side, styles.right]}>{right}</View>
      </View>
      {largeTitle ? (
        <Text variant="largeTitle" accessibilityRole="header" numberOfLines={1} style={styles.largeTitle}>
          {title}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { height: APP_HEADER_BAR_HEIGHT, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, gap: spacing.sm },
  // Equal-width slots (two 44 pt buttons and the gap) keep the title truly centred.
  side: { width: SIDE_WIDTH, flexDirection: 'row', alignItems: 'center' },
  right: { justifyContent: 'flex-end' },
  flex: { flex: 1 },
  title: { flex: 1, textAlign: 'center' },
  largeTitle: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
});

/** For `screenOptions.header` — a function, so the navigator can call it with its header props. */
export function renderAppHeader(props: AppHeaderProps) {
  return <AppHeader {...props} />;
}

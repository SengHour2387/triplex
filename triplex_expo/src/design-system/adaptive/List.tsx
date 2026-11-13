import { Children, cloneElement, isValidElement, type ReactElement } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '../Icon';
import type { IconName } from '../icons';
import { Text } from '../Text';
import { radii, spacing } from '../tokens';
import { useTheme } from '../useTheme';
import { Switch } from './Switch';

export type ListAccessory = 'chevron' | 'check' | 'none';

export interface ListRowProps {
  title: string;
  subtitle?: string;
  /** Leading glyph. With `iconTint` it sits on a coloured rounded tile (iOS Settings style). */
  icon?: IconName;
  iconTint?: string;
  /**
   * A custom leading element (an `Avatar`) in place of `icon`. Give its width as `leadingSize` so the
   * separator lines up with the text.
   */
  leading?: React.ReactNode;
  leadingSize?: number;
  /** Trailing secondary text ("English", "On"). */
  value?: string;
  /** Defaults to a chevron when the row is tappable, otherwise none. */
  accessory?: ListAccessory;
  /** A trailing switch. The row itself then does not navigate. */
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  destructive?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  accessibilityHint?: string;
  testID?: string;
  /** Set by `ListSection` — the last row draws no separator. */
  last?: boolean;
}

const TILE = 30;
const ROW_MIN_HEIGHT = 52;

/**
 * Which trailing control a row shows — pure, so the rule is testable. A chevron means "opens
 * something", so a tappable row gets one by default — except a destructive row, which *does* something
 * (sign out, delete) and shows none.
 */
export function resolveAccessory({ switchValue, onSwitchChange, accessory, onPress, destructive }: Pick<ListRowProps, 'switchValue' | 'onSwitchChange' | 'accessory' | 'onPress' | 'destructive'>): ListAccessory | 'switch' {
  if (switchValue !== undefined && onSwitchChange) return 'switch';
  if (accessory) return accessory;
  return onPress && !destructive ? 'chevron' : 'none';
}

/** One row of an inset-grouped list: leading glyph, title (+ subtitle), trailing value / chevron / check / switch. */
export function ListRow({ title, subtitle, icon, iconTint, leading, leadingSize = 0, value, accessory, switchValue, onSwitchChange, destructive = false, disabled = false, onPress, accessibilityHint, testID, last = false }: ListRowProps) {
  const { colors } = useTheme();
  const trailing = resolveAccessory({ switchValue, onSwitchChange, accessory, onPress, destructive });
  const tappable = Boolean(onPress) && trailing !== 'switch';
  const titleColor = destructive ? colors.destructive : colors.text;

  const content = (
    <>
      {leading ? (
        leading
      ) : icon ? (
        iconTint ? (
          <View style={[styles.tile, { backgroundColor: iconTint }]}>
            <Icon name={icon} size={17} color={colors.thumb} />
          </View>
        ) : (
          <Icon name={icon} size={20} color={titleColor} />
        )
      ) : null}

      <View style={styles.body}>
        <Text variant="body" numberOfLines={2} style={{ color: titleColor }}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="footnote" color="textSecondary" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {value ? (
        <Text variant="body" color="textSecondary" numberOfLines={1} style={styles.value}>
          {value}
        </Text>
      ) : null}
      {trailing === 'chevron' ? <Icon name="chevronRight" size={14} color={colors.textSecondary} /> : null}
      {trailing === 'check' ? <Icon name="check" size={18} color={colors.accent} /> : null}
      {trailing === 'switch' ? <Switch value={switchValue ?? false} onValueChange={onSwitchChange ?? (() => undefined)} label={title} disabled={disabled} /> : null}
    </>
  );

  const separator = last ? null : (
    <View pointerEvents="none" style={[styles.separator, { left: spacing.lg + (leading ? leadingSize + spacing.md : icon && iconTint ? TILE + spacing.md : 0), backgroundColor: colors.separator }]} />
  );

  if (!tappable) {
    return (
      <View testID={testID} style={[styles.row, { opacity: disabled && trailing !== 'switch' ? 0.4 : 1 }]}>
        {content}
        {separator}
      </View>
    );
  }

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={value ? `${title}, ${value}` : title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.row, { opacity: disabled ? 0.4 : 1 }, pressed && { backgroundColor: colors.fieldFill }]}
    >
      {content}
      {separator}
    </Pressable>
  );
}

export interface ListSectionProps {
  /** Small caps heading above the group. */
  title?: string;
  /** Explanatory text below the group. */
  footer?: string;
  /** `ListRow`s (anything else is rendered as is). */
  children: React.ReactNode;
}

/** A rounded white group of rows with hairline separators — iOS's inset grouped list section. */
export function ListSection({ title, footer, children }: ListSectionProps) {
  const { colors } = useTheme();
  const rows = Children.toArray(children).filter(isValidElement) as ReactElement<{ last?: boolean }>[];

  return (
    <View style={styles.section}>
      {title ? (
        <Text variant="footnote" color="textSecondary" accessibilityRole="header" style={styles.heading}>
          {title.toUpperCase()}
        </Text>
      ) : null}
      <View style={[styles.group, { backgroundColor: colors.surface }]}>
        {rows.map((row, index) => cloneElement(row, { last: index === rows.length - 1 }))}
      </View>
      {footer ? (
        <Text variant="footnote" color="textSecondary" style={styles.footer}>
          {footer}
        </Text>
      ) : null}
    </View>
  );
}

/** Stacks `ListSection`s with the standard gap. */
export function List({ children }: { children: React.ReactNode }) {
  return <View style={styles.list}>{children}</View>;
}

const styles = StyleSheet.create({
  list: { gap: spacing.xl },
  section: { gap: spacing.sm },
  heading: { marginHorizontal: spacing.lg },
  footer: { marginHorizontal: spacing.lg },
  group: { borderRadius: radii.lg, borderCurve: 'continuous', overflow: 'hidden' },
  row: { minHeight: ROW_MIN_HEIGHT, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  tile: { width: TILE, height: TILE, borderRadius: 8, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: 1 },
  value: { flexShrink: 1, maxWidth: '45%' },
  separator: { position: 'absolute', bottom: 0, right: 0, height: StyleSheet.hairlineWidth },
});

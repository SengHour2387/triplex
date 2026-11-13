import { Pressable, StyleSheet, View } from 'react-native';

import { Glass } from './Glass';
import { Icon } from './Icon';
import { Text } from './Text';
import { spacing } from './tokens';

export interface SheetHeaderProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
}

const CLOSE_SIZE = 44;

/**
 * Title on the left, a circular glass close button on the right — the header Apple's own iOS 26
 * sheets use. Sits at the top of a sheet's content (the grabber lives above it).
 */
export function SheetHeader({ title, subtitle, onClose }: SheetHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.titles}>
        <Text variant="title" accessibilityRole="header" numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="subhead" color="textSecondary" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} hitSlop={6}>
        <Glass interactive radius="pill" style={styles.close}>
          <Icon name="close" size={16} />
        </Glass>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  titles: { flex: 1, gap: 2, paddingTop: spacing.xs },
  close: { width: CLOSE_SIZE, height: CLOSE_SIZE, alignItems: 'center', justifyContent: 'center' },
});

import { useState, type Ref } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Glass } from '../Glass';
import { Icon } from '../Icon';
import { Text } from '../Text';
import { MAX_FONT_SCALE, spacing } from '../tokens';
import { useTheme } from '../useTheme';

export interface SearchFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  /** Called by the Cancel button, which appears while the field is focused. */
  onCancel?: () => void;
  autoFocus?: boolean;
  ref?: Ref<TextInput>;
  testID?: string;
}

const HEIGHT = 44;

/**
 * iOS 26's search field: a glass capsule with a magnifier, a clear (×) button once there is text, and
 * a Cancel button beside it while editing. One implementation for both platforms.
 */
export function SearchField({ value, onChangeText, placeholder = 'Search', onSubmit, onCancel, autoFocus, ref, testID }: SearchFieldProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.row} accessibilityRole="search">
      <Glass radius="pill" style={styles.field}>
        <Icon name="search" size={16} color={colors.textSecondary} />
        <TextInput
          ref={ref}
          testID={testID}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          selectionColor={colors.text}
          accessibilityLabel={placeholder}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          autoFocus={autoFocus}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onSubmitEditing={onSubmit}
          style={[styles.input, { color: colors.text }]}
        />
        {value.length > 0 ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Clear text" hitSlop={10} onPress={() => onChangeText('')}>
            <Icon name="clear" size={18} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </Glass>

      {focused && onCancel ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Cancel" hitSlop={8} onPress={onCancel}>
          <Text variant="body" color="accent">
            Cancel
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  field: { flex: 1, minHeight: HEIGHT, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md },
  input: { flex: 1, fontSize: 17, paddingVertical: 0 },
});

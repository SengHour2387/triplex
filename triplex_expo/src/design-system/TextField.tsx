import { useEffect, useState, type Ref } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Icon } from './Icon';
import { Text } from './Text';
import { useFontScale } from './useFontScale';
import { MAX_FONT_SCALE, radii, spacing } from './tokens';
import { useTheme } from './useTheme';

export interface TextFieldProps
  extends Omit<TextInputProps, 'style' | 'placeholder' | 'placeholderTextColor' | 'accessibilityLabel'> {
  /** Floating label — also the accessible name. */
  label: string;
  /** Shown only once the label has floated (focused or filled). */
  hint?: string;
  /** Validation message. Turns the border red and is announced to screen readers. */
  error?: string | null;
  /** Adds a show/hide toggle. Implies `secureTextEntry` until revealed. */
  password?: boolean;
  ref?: Ref<TextInput>;
  style?: StyleProp<ViewStyle>;
}

const FLOAT_SCALE = 12 / 17;
const FIELD_HEIGHT = 60;
const LABEL_FLOAT_RISE = 13;
const ANIM_MS = 150;

/**
 * Rounded field with a floating label — Flutter's `OutlineTextField` (16-pt radius, tinted fill,
 * 1 → 2 pt border on focus, red on error), re-expressed for iOS: continuous corners, Dynamic Type,
 * and password autofill via `textContentType` / `autoComplete` (pass them through).
 */
export function TextField({
  label,
  hint,
  error,
  password = false,
  value,
  onFocus,
  onBlur,
  ref,
  style,
  ...rest
}: TextFieldProps) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const fontScale = useFontScale();
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const floated = focused || Boolean(value);
  const progress = useSharedValue(floated ? 1 : 0);
  useEffect(() => {
    progress.set(withTiming(floated ? 1 : 0, { duration: reduceMotion ? 0 : ANIM_MS }));
  }, [floated, reduceMotion, progress]);

  const labelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -progress.get() * LABEL_FLOAT_RISE * fontScale }, { scale: 1 - progress.get() * (1 - FLOAT_SCALE) }],
  }));

  const multiline = Boolean(rest.multiline);
  const minHeight = Math.round(FIELD_HEIGHT * fontScale);
  const lineHeight = Math.round(22 * fontScale);

  const hasError = Boolean(error);
  const borderColor = hasError ? colors.error : focused ? colors.text : colors.outline;
  const borderWidth = hasError || focused ? 2 : 1;

  return (
    <View style={style}>
      <View
        style={[
          styles.container,
          { backgroundColor: colors.fieldFill },
          // A multiline field starts as tall as a single-line one and grows with its text, up to three lines.
          multiline ? [styles.containerMultiline, { minHeight, maxHeight: minHeight + 2 * lineHeight }] : { height: minHeight },
        ]}
      >
        <Animated.Text
          pointerEvents="none"
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          numberOfLines={1}
          style={[
            styles.label,
            { color: hasError ? colors.error : colors.textSecondary, top: Math.round(18 * fontScale), lineHeight: Math.round(22 * fontScale) },
            labelStyle,
          ]}
        >
          {label}
        </Animated.Text>

        <TextInput
          ref={ref}
          {...rest}
          value={value}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          secureTextEntry={password && !revealed}
          placeholder={floated ? hint : undefined}
          placeholderTextColor={colors.textSecondary}
          selectionColor={colors.text}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          accessibilityLabel={label}
          accessibilityHint={error ?? undefined}
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            {
              color: colors.text,
              paddingRight: password ? 52 : spacing.lg,
              // A multiline input (a UITextView) draws its first line higher than a single-line one; this keeps it clear of the floated label.
              paddingTop: Math.round((multiline ? 27 : 22) * fontScale),
              paddingBottom: Math.round(6 * fontScale),
            },
          ]}
        />

        {password ? (
          <Pressable
            onPress={() => setRevealed((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
            hitSlop={8}
            style={styles.toggle}
          >
            <Icon name={revealed ? 'eyeOff' : 'eye'} size={20} color={colors.textSecondary} />
          </Pressable>
        ) : null}

        {/* Border is an overlay so the 1 → 2 pt change on focus never shifts the layout. */}
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.border, { borderColor, borderWidth }]} />
      </View>

      {hasError ? (
        <Text variant="footnote" color="error" accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.md,
    borderCurve: 'continuous',
    justifyContent: 'center',
  },
  containerMultiline: { justifyContent: 'flex-start' },
  label: {
    position: 'absolute',
    left: spacing.lg,
    top: 18,
    fontSize: 17,
    lineHeight: 22,
    transformOrigin: 'left center',
  },
  input: {
    flex: 1,
    paddingLeft: spacing.lg,
    paddingTop: 22,
    paddingBottom: 6,
    fontSize: 17,
  },
  // Content-sized (not `flex: 1`, which would collapse the input to nothing in a container with no fixed height).
  inputMultiline: { flex: 0, flexGrow: 1, textAlignVertical: 'top' },
  toggle: { position: 'absolute', right: spacing.lg, top: 0, bottom: 0, justifyContent: 'center' },
  border: { borderRadius: radii.md, borderCurve: 'continuous' },
  error: { marginTop: spacing.xs, marginHorizontal: spacing.xs },
});

import type { Ref } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Avatar } from './Avatar';
import { Glass } from './Glass';
import { Icon } from './Icon';
import { Text } from './Text';
import { MAX_FONT_SCALE, spacing } from './tokens';
import { useFontScale } from './useFontScale';
import { useTheme } from './useTheme';

export interface ComposerBarProps {
  value: string;
  onChangeText: (text: string) => void;
  /** Called by the send button. It is disabled while the text is empty or `submitting`. */
  onSubmit: () => void;
  placeholder: string;
  /** Who is writing — their picture sits at the start of the bar. */
  avatar: { uri: string | null; name: string };
  /** "Replying to @name" strip above the bar, with a button to cancel. */
  replyingTo?: string | null;
  onCancelReply?: () => void;
  submitting?: boolean;
  /** Accessible name of the send button ("Send comment"). */
  sendLabel?: string;
  maxLength?: number;
  ref?: Ref<TextInput>;
  testID?: string;
}

const AVATAR = 32;
const SEND = 36;

/**
 * A glass bar to write a short message in: your picture, a text box that grows (up to about five lines),
 * and a round send button. For the comments sheet and the post screen; lay it out at the bottom of a
 * keyboard-aware container — the bar itself only draws. Pass the bottom safe-area padding from outside.
 */
export function ComposerBar({ value, onChangeText, onSubmit, placeholder, avatar, replyingTo, onCancelReply, submitting = false, sendLabel = 'Send', maxLength = 2000, ref, testID }: ComposerBarProps) {
  const { colors } = useTheme();
  const fontScale = useFontScale();
  const canSend = value.trim().length > 0 && !submitting;
  const lineHeight = Math.round(21 * fontScale);

  return (
    <View style={styles.root}>
      {replyingTo ? (
        <View style={styles.reply}>
          <Icon name="reply" size={14} color={colors.textSecondary} />
          <Text variant="footnote" color="textSecondary" numberOfLines={1} style={styles.replyText}>
            Replying to <Text variant="footnote" weight="600">{`@${replyingTo}`}</Text>
          </Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Cancel reply" onPress={onCancelReply} hitSlop={10}>
            <Icon name="close" size={14} color={colors.textSecondary} />
          </Pressable>
        </View>
      ) : null}

      <Glass radius="xl" opaque style={styles.bar}>
        <View style={styles.avatar}>
          <Avatar uri={avatar.uri} name={avatar.name} size={AVATAR} />
        </View>
        <TextInput
          ref={ref}
          testID={testID}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          selectionColor={colors.text}
          accessibilityLabel={placeholder}
          multiline
          maxLength={maxLength}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          autoCapitalize="sentences"
          textAlignVertical="center"
          style={[styles.input, { color: colors.text, fontSize: 16, lineHeight, minHeight: SEND, maxHeight: lineHeight * 5 + spacing.md }]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={sendLabel}
          accessibilityState={{ disabled: !canSend, busy: submitting }}
          disabled={!canSend}
          onPress={onSubmit}
          hitSlop={6}
          style={[styles.send, { backgroundColor: canSend || submitting ? colors.primary : colors.controlFill }]}
        >
          {submitting ? <ActivityIndicator size="small" color={colors.onPrimary} /> : <Icon name="arrowUp" size={18} color={canSend ? colors.onPrimary : colors.textSecondary} />}
        </Pressable>
      </Glass>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.sm },
  reply: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg },
  replyText: { flex: 1 },
  bar: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm - 2 },
  avatar: { height: SEND, justifyContent: 'center' },
  input: { flex: 1, paddingTop: 7, paddingBottom: 7, paddingHorizontal: spacing.xs },
  send: { width: SEND, height: SEND, borderRadius: SEND / 2, alignItems: 'center', justifyContent: 'center' },
});

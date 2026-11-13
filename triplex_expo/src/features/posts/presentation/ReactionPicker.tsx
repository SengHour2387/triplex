import { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Glass, spacing, Text } from '../../../design-system';
import { REACTIONS, type ReactionInfo, type ReactionType } from '../model/reactions';
import { pickerPosition, PICKER_HEIGHT, pickerWidth, type Rect } from '../model/pickerPosition';

export interface ReactionPickerProps {
  /** Where the like button is on screen (window coordinates). Null = closed. */
  anchor: Rect | null;
  current: ReactionType | null;
  onSelect: (type: ReactionType) => void;
  onDismiss: () => void;
}

const EMOJI_SIZE = 28;

/**
 * The long-press reaction bar: a glass pill of the seven reactions floating above the like button.
 * Tap one to choose it; tap anywhere else (or press Back on Android) to dismiss. Reactions grow under
 * the finger for feedback. Screen-reader users don't need it: the like button exposes the same seven
 * choices as custom actions.
 */
export function ReactionPicker({ anchor, current, onSelect, onDismiss }: ReactionPickerProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();

  return (
    <Modal visible={anchor !== null} transparent animationType="fade" onRequestClose={onDismiss} statusBarTranslucent>
      {anchor ? (
        <View style={styles.fill} accessibilityViewIsModal>
          <Pressable style={styles.fill} onPress={onDismiss} accessibilityRole="button" accessibilityLabel="Close reactions" />
          <Animated.View
            entering={reduceMotion ? undefined : ZoomIn.springify().damping(16).duration(240)}
            style={[styles.bar, pickerPosition(anchor, { width: windowWidth, height: windowHeight }, insets.top)]}
          >
            <Glass radius="pill" opaque style={styles.glass}>
              {REACTIONS.map((reaction) => (
                <ReactionButton key={reaction.type} reaction={reaction} selected={reaction.type === current} onPress={() => onSelect(reaction.type)} />
              ))}
            </Glass>
          </Animated.View>
        </View>
      ) : null}
    </Modal>
  );
}

function ReactionButton({ reaction, selected, onPress }: { reaction: ReactionInfo; selected: boolean; onPress: () => void }) {
  const reduceMotion = useReducedMotion();
  const lift = useSharedValue(selected ? 1 : 0);
  useEffect(() => {
    lift.set(selected ? 1 : 0);
  }, [selected, lift]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: 1 + lift.get() * 0.2 }, { translateY: -lift.get() * 3 }] }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={reaction.label}
      accessibilityState={{ selected }}
      onPressIn={() => lift.set(reduceMotion ? 1 : withSpring(1.8, { damping: 12, stiffness: 260 }))}
      onPressOut={() => lift.set(reduceMotion ? (selected ? 1 : 0) : withTiming(selected ? 1 : 0, { duration: 120 }))}
      onPress={onPress}
      hitSlop={{ top: 8, bottom: 8 }}
      style={styles.button}
    >
      <Animated.View style={style}>
        {/* The bar has a fixed width, so its emoji grow with Dynamic Type only a little. */}
        <Text maxFontSizeMultiplier={1.15} style={styles.emoji}>
          {reaction.emoji}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: StyleSheet.absoluteFill,
  bar: { position: 'absolute', height: PICKER_HEIGHT, width: pickerWidth() },
  glass: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', paddingHorizontal: spacing.xs },
  button: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: EMOJI_SIZE, lineHeight: EMOJI_SIZE + 6, textAlign: 'center' },
});

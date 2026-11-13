import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassButton, SheetHeader, Spinner, spacing, Text, TextField } from '../../../design-system';
import { usePost } from '../hooks/usePost';
import { useRepost } from '../hooks/useRepost';
import { repostTarget } from '../model/post';
import { EmbeddedPost } from './EmbeddedPost';

/**
 * Repost with an optional quote — a native sheet. (A formSheet that holds a ScrollView must have exactly
 * two children — the header and the ScrollView — and the header needs `collapsable={false}`, or React
 * Native flattens it away and the sheet lays the scroll content over the header. react-native-screens
 * warns about this; found on device.) Reposting a repost reposts its *original* (which is
 * what the preview shows); Flutter previewed the original but posted a repost-of-the-repost.
 */
export function RepostSheet() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { post, isLoading } = usePost(postId);
  const repost = useRepost();
  const [caption, setCaption] = useState('');

  const target = post ? repostTarget(post) : null;
  const busy = repost.isPending;

  const submit = () => {
    if (!target || busy) return;
    repost.mutate({ originalId: target.id, caption }, { onSuccess: () => router.back() });
  };

  return (
    <View style={[styles.root, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
      {/* A half-finished repost must not be interrupted by swiping the sheet away. */}
      <Stack.Screen options={{ gestureEnabled: !busy }} />
      <View style={styles.pad} collapsable={false}>
        <SheetHeader title="Repost" onClose={() => !busy && router.back()} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <Spinner size="large" label="Loading post" />
        </View>
      ) : (
        <ScrollView style={styles.fill} contentContainerStyle={[styles.pad, styles.body]} automaticallyAdjustKeyboardInsets keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive" showsVerticalScrollIndicator={false}>
          <TextField label="Add your thoughts (optional)" value={caption} onChangeText={setCaption} multiline textAlignVertical="top" autoCapitalize="sentences" />

          <Text variant="footnote" weight="500" color="textSecondary">
            Original post
          </Text>
          <EmbeddedPost post={target} interactive={false} />

          <GlassButton label="Repost now" onPress={submit} loading={busy} disabled={target === null} testID="repost-submit" />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: spacing.xl },
  pad: { paddingHorizontal: spacing.xl },
  fill: { flex: 1 },
  body: { gap: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

import { useLocalSearchParams, useRouter } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SheetHeader, spacing } from '../../../design-system';
import { useComments } from '../hooks/useComments';
import { useCommentsController } from '../hooks/useCommentsController';
import { useKeyboardHeight } from '../hooks/useKeyboardHeight';
import { CommentComposer } from './CommentComposer';
import { CommentList } from './CommentList';

/**
 * A post's comments in a native sheet, opened from the count on a card: the list (pull to refresh), and the
 * glass composer pinned under it, lifted by the keyboard's height (`useKeyboardHeight`). (A formSheet that holds a ScrollView takes
 * exactly two children — the header, and the body — and the header needs `collapsable={false}`; see RepostSheet.)
 */
export function CommentsSheet() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const state = useComments(postId);
  const controller = useCommentsController(postId);
  const keyboard = useKeyboardHeight();

  return (
    <View style={styles.root}>
      <View style={styles.pad} collapsable={false}>
        <SheetHeader title="Comments" onClose={() => router.back()} />
      </View>

      <View style={styles.fill}>
        <ScrollView
          style={styles.fill}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={state.isRefreshing} onRefresh={() => void state.refresh()} />}
        >
          <CommentList state={state} controller={controller} />
        </ScrollView>
        <View
          style={[
            styles.composer,
            {
              paddingBottom: keyboard > 0 ? keyboard + spacing.sm : Math.max(insets.bottom, spacing.lg),
            },
          ]}
        >
          <CommentComposer controller={controller} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: spacing.xl },
  pad: { paddingHorizontal: spacing.xl, paddingBottom: spacing.sm },
  fill: { flex: 1 },
  list: { flexGrow: 1, paddingBottom: spacing.lg },
  composer: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
});

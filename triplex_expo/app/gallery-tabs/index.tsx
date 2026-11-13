import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Glass, GlassButton, ProgressiveBlur, Text, spacing, useExpandTabBarOnScrollUp, useScrollInsets, useTheme } from '../../src/design-system';

const POSTS = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  user: ['alice', 'bob', 'chea', 'dara', 'eang'][i % 5],
  hue: ['#4F8BFF', '#FFD23F', '#3DDC97', '#B04FFF', '#FF6B4A'][i % 5],
}));

/** Stand-in feed: long, colourful content so the tab bar's blur and scroll-minimise are visible. */
export default function FeedDemo() {
  const { colors } = useTheme();
  const router = useRouter();
  const onScroll = useExpandTabBarOnScrollUp();
  const inset = useScrollInsets();

  // No wrapper View: native tabs find the scroll view that drives minimize-on-scroll by following only
  // the *first* child of the screen (react-native-screens #3954), so the ScrollView must stay first.
  return (
    <>
    <ScrollView
      onScroll={onScroll}
      scrollEventThrottle={16}
      style={{ backgroundColor: colors.background }}
      // Lets the native tab bar / navigation chrome track this scroll view and inset it correctly.
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[styles.content, { paddingTop: spacing.lg + inset.top, paddingBottom: spacing.xxl * 2 + inset.bottom }]}
    >
      <View style={styles.header}>
        <Text variant="pageTitle">Feed</Text>
        <GlassButton label="Back to gallery" size="compact" variant="glass" onPress={() => router.dismissTo('/gallery')} />
      </View>
      <Text variant="subhead" color="textSecondary">
        Scroll down: on iOS 26 the tab bar shrinks to a pill, and expands when you scroll back up.
      </Text>

      {POSTS.map((p) => (
        <Glass key={p.id} radius="lg" style={styles.post}>
          <View style={styles.postHeader}>
            <View style={[styles.avatar, { backgroundColor: p.hue }]} />
            <Text weight="600">@{p.user}</Text>
          </View>
          <View style={[styles.photo, { backgroundColor: p.hue }]} />
          <Text variant="subhead" color="textSecondary">
            Post {p.id + 1} — a long caption to give the card some body text under the photo.
          </Text>
        </Glass>
      ))}
    </ScrollView>
    <ProgressiveBlur />
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl * 2 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  post: { padding: spacing.md, gap: spacing.sm },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: { width: 32, height: 32, borderRadius: 16 },
  photo: { height: 180, borderRadius: 14 },
});

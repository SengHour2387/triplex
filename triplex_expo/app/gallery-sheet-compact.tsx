import { Redirect, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassButton, SheetHeader, Text, toast, spacing } from '../src/design-system';

/**
 * Dev-only demo: a compact, fit-to-content native sheet — the confirmation pattern (e.g. "Delete
 * draft?"). Presentation options live in `app/_layout.tsx`.
 */
export default function GallerySheetCompact() {
  if (!__DEV__) return <Redirect href="/" />;
  return <CompactSheet />;
}

function CompactSheet() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // `fitToContents` sizes the sheet to this view, so it must have an intrinsic height (no flex: 1).
  return (
    <View style={[styles.content, { paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.sm }]}>
      <SheetHeader title="Delete this draft?" onClose={() => router.back()} />
      <Text color="textSecondary">
        “Phnom Penh → Kampot → Kep” and its 3 stops will be removed. This can’t be undone.
      </Text>
      <View style={styles.actions}>
        <GlassButton
          label="Delete draft"
          onPress={() => {
            router.back();
            toast.success('Draft deleted');
          }}
        />
        <GlassButton label="Cancel" variant="plain" onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, gap: spacing.lg },
  actions: { gap: spacing.sm, marginTop: spacing.sm },
});

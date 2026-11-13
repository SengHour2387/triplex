import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassButton, SheetHeader, Text, TextField, toast, spacing } from '../src/design-system';

/**
 * Dev-only demo: a resizable native sheet (half ↔ full) with scrolling content and a text field.
 * Presentation options live in `app/_layout.tsx` (`sheetOptions`).
 */
export default function GallerySheet() {
  if (!__DEV__) return <Redirect href="/" />;
  return <ResizableSheet />;
}

const WAYPOINTS = Array.from({ length: 14 }, (_, i) => `Waypoint ${i + 1}`);

function ResizableSheet() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const shown = WAYPOINTS.filter((w) => w.toLowerCase().includes(query.trim().toLowerCase()));

  // NOTE: a transparent container, not <Screen> — an opaque background would hide the sheet's glass.
  return (
    <View style={styles.fill}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.lg }]}
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
      >
        <SheetHeader title="Trip stops" subtitle="Drag the grabber or scroll to resize" onClose={() => router.back()} />

        <TextField label="Filter stops" value={query} onChangeText={setQuery} autoCorrect={false} />

        {/* Prominent, not glass: glass on a glass sheet has no visible affordance. */}
        <GlassButton
          label="Show a toast over this sheet"
          onPress={() => toast.success('Toast raised from inside a sheet')}
        />

        <View style={styles.list}>
          {shown.length === 0 ? (
            <Text color="textSecondary">No stops match “{query}”.</Text>
          ) : (
            shown.map((name) => (
              <View key={name} style={styles.item}>
                <Text weight="600">{name}</Text>
                <Text variant="footnote" color="textSecondary">
                  Tap-and-hold to reorder
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, gap: spacing.lg },
  list: { gap: spacing.md },
  item: { paddingVertical: spacing.sm, gap: 2 },
});

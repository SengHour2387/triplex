import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { GlassButton, Screen, Text, TextField, toast, spacing } from '../../src/design-system';

/** Stand-in Create tab: a short, non-scrolling page with a field — to see the tab bar + keyboard. */
export default function CreateDemo() {
  const router = useRouter();
  const [caption, setCaption] = useState('');

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text variant="pageTitle">Create</Text>
        <GlassButton label="Back to gallery" size="compact" variant="glass" onPress={() => router.dismissTo('/gallery')} />
      </View>
      <View style={styles.body}>
        <TextField label="Caption" value={caption} onChangeText={setCaption} />
        <GlassButton label="Post" onPress={() => toast.success('Posted (demo)')} />
        <Text variant="subhead" color="textSecondary">
          Short page: the tab bar stays put. Tap the field to check the keyboard against the tab bar.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm },
  body: { gap: spacing.lg, marginTop: spacing.xl },
});

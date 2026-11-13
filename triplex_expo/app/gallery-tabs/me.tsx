import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Glass, GlassButton, Screen, Text, spacing } from '../../src/design-system';

/** Stand-in Me tab (account header). The tab itself carries a badge of 3 to test badges. */
export default function MeDemo() {
  const router = useRouter();

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="pageTitle">Me</Text>
        <GlassButton label="Back to gallery" size="compact" variant="glass" onPress={() => router.dismissTo('/gallery')} />
      </View>
      <Glass radius="lg" style={styles.card}>
        <View style={styles.avatar} />
        <View>
          <Text variant="headline">Alice Example</Text>
          <Text variant="subhead" color="textSecondary">@alice · alice@example.com</Text>
        </View>
      </Glass>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm },
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, marginTop: spacing.xl },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#4F8BFF' },
});

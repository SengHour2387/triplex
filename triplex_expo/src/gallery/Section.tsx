import { StyleSheet, View } from 'react-native';

import { Text } from '../design-system';

/** A titled block of the dev Gallery. */
export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="footnote" color="textSecondary" weight="600" style={styles.title}>
        {title.toUpperCase()}
      </Text>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 28 },
  title: { marginBottom: 10, marginLeft: 4, letterSpacing: 0.4 },
  body: { gap: 12 },
});

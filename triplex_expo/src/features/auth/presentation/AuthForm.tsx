import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { LOGO_FONT, Screen, spacing, Text } from '../../../design-system';

/** Shared frame for login/register: wordmark, title, fields, one server error, actions. */
export function AuthForm({
  title,
  serverError,
  children,
  footer,
}: {
  title: string;
  serverError: string | null;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.brand}>
        <Text variant="logo" accessibilityRole="header" style={{ fontFamily: LOGO_FONT }}>
          TripleX
        </Text>
        <Text variant="caption" color="textSecondary">
          by T3MPLEX
        </Text>
      </View>

      <Text variant="title">{title}</Text>
      <View style={styles.fields}>{children}</View>

      {serverError ? (
        <Text variant="footnote" color="error" accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.serverError}>
          {serverError}
        </Text>
      ) : null}

      <View style={styles.footer}>{footer}</View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center', paddingTop: spacing.xl, gap: spacing.md },
  brand: { marginBottom: spacing.xl },
  fields: { gap: spacing.md },
  serverError: { paddingHorizontal: spacing.xs },
  footer: { gap: spacing.sm, marginTop: spacing.md },
});

import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { GlassButton, GlassRow, OptionPicker, Screen, spacing, Text } from '../../../design-system';
import { useAuthStore } from '../../auth/store/authStore';
import { THEME_OPTIONS } from '../model/theme';
import { useThemeStore } from '../store/themeStore';
import { AccountCard } from './AccountCard';

/** Settings: the account card, the theme, and signing out. */
export function SettingsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isLoading = useAuthStore((s) => s.isLoading);
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);

  return (
    <Screen scroll underHeader keyboardInsets={false}>
      <View style={styles.content}>
        {user ? <AccountCard user={user} onPress={() => router.push('/settings/account')} /> : null}

        <View style={styles.section}>
          <Text variant="footnote" color="textSecondary" style={styles.sectionTitle} accessibilityRole="header">
            APPEARANCE
          </Text>
          <OptionPicker label="Theme" value={preference} options={THEME_OPTIONS} onChange={setPreference} />
        </View>

        {__DEV__ ? <GlassRow label="Design gallery (dev only)" icon="gallery" onPress={() => router.push('/gallery')} testID="open-gallery" /> : null}

        <GlassButton label="Sign out" variant="glass" icon="signOut" onPress={() => void logout()} loading={isLoading} testID="sign-out" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.xl, paddingTop: spacing.sm },
  section: { gap: spacing.sm },
  sectionTitle: { marginHorizontal: spacing.xs },
});

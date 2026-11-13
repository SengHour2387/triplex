import * as Haptics from 'expo-haptics';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassButton, SheetHeader, spacing, TextField, toast } from '../../../design-system';
import { useSaveAccount } from '../hooks/useSaveAccount';

/**
 * Password confirmation for an email change, shown as a native sheet. Route params carry the drafts
 * (`username` is optional); the save is performed here so a wrong password is reported inline and the
 * sheet stays open for another try.
 */
export function ConfirmPasswordSheet() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ username?: string; email?: string }>();
  const save = useSaveAccount();

  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const email = params.email ?? '';

  const onConfirm = async () => {
    if (saving) return;
    if (!password) {
      setError('Enter your password.');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const outcome = await save({ username: params.username ?? '', email }, password);
      if (!outcome) return;
      if (outcome.ok) {
        router.back();
        toast.success(outcome.message);
      } else {
        setError(outcome.message);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.content, { paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.sm }]}>
      {/* A half-finished save must not be interrupted by swiping the sheet away. */}
      <Stack.Screen options={{ gestureEnabled: !saving }} />
      <SheetHeader title="Confirm password" subtitle={`Enter your password to change your email to ${email}`} onClose={() => !saving && router.back()} />
      <TextField
        label="Password"
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          setError(null);
        }}
        error={error}
        password
        autoFocus
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="password"
        autoComplete="current-password"
        returnKeyType="done"
        onSubmitEditing={() => void onConfirm()}
      />
      <GlassButton label="Confirm" onPress={() => void onConfirm()} loading={saving} testID="confirm-password" />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, gap: spacing.lg },
});

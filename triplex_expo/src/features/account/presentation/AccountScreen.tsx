import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, View, type TextInput } from 'react-native';

import { GlassButton, Screen, spacing, Text, TextField, toast } from '../../../design-system';
import { useAuthStore } from '../../auth/store/authStore';
import { useSaveAccount } from '../hooks/useSaveAccount';
import { useUsernameAvailability } from '../hooks/useUsernameAvailability';
import { canSave, diffAccount, normalizeUsername, validateEmail, validateUsername } from '../model/accountForm';
import { UsernameStatusLine } from './UsernameStatusLine';

/**
 * Account center: change username and/or email.
 *
 * Username-only → saved straight away. Changing the email needs the current password, asked for in
 * a native sheet (`confirm-password`) that performs the save, so the password never lives in this
 * screen's state.
 */
export function AccountScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const save = useSaveAccount();
  const current = { username: user?.username ?? '', email: user?.email ?? '' };

  const [username, setUsername] = useState(current.username);
  const [email, setEmail] = useState(current.email);
  const [saving, setSaving] = useState(false);
  const emailRef = useRef<TextInput>(null);

  const draft = { username, email };
  const status = useUsernameAvailability(username, current.username);
  const changes = diffAccount(current, draft);

  // Only complain about a field once it differs from what is saved.
  const usernameError =
    changes.username === undefined
      ? null
      : (validateUsername(username) ?? (status === 'taken' ? 'That username is already taken.' : null));
  const emailError = changes.email === undefined ? null : validateEmail(email);

  const enabled = canSave(draft, current, status, saving);

  const onSave = async () => {
    if (!enabled) return;
    if (changes.email !== undefined) {
      // Hand both drafts to the sheet; it diffs again at submit time (see `useSaveAccount`).
      router.push({ pathname: '/settings/confirm-password', params: { username: normalizeUsername(username), email } });
      return;
    }
    setSaving(true);
    try {
      const outcome = await save(draft);
      if (!outcome) return;
      if (outcome.ok) toast.success(outcome.message);
      else {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        toast.error(outcome.message);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll underHeader>
      <View style={styles.content}>
        <View>
          <TextField
            label="Username"
            value={username}
            onChangeText={setUsername}
            error={usernameError}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="username"
            autoComplete="username-new"
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
          />
          <UsernameStatusLine status={status} />
        </View>

        <TextField
          ref={emailRef}
          label="Email"
          value={email}
          onChangeText={setEmail}
          error={emailError}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
          returnKeyType="done"
          onSubmitEditing={() => void onSave()}
        />

        <Text variant="footnote" color="textSecondary" style={styles.note}>
          Changing your email address requires your current password.
        </Text>

        <GlassButton label="Save changes" onPress={() => void onSave()} disabled={!enabled && !saving} loading={saving} testID="save-account" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg, paddingTop: spacing.sm },
  note: { marginHorizontal: spacing.xs },
});

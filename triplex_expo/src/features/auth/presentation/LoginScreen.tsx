import { useRouter } from 'expo-router';
import { useRef } from 'react';
import type { TextInput } from 'react-native';

import { GlassButton, TextField } from '../../../design-system';
import { useAuthStore } from '../store/authStore';
import { toLoginCredentials, validateLogin } from '../validation/rules';
import { AuthForm } from './AuthForm';
import { useAuthForm } from './useAuthForm';

export function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const passwordRef = useRef<TextInput>(null);

  const form = useAuthForm({
    initial: { identifier: '', password: '' },
    validate: validateLogin,
    submit: (values) => login(toLoginCredentials(values)),
  });

  return (
    <AuthForm
      title="Login to your account"
      serverError={form.serverError}
      footer={
        <>
          <GlassButton label="Login" onPress={form.onSubmit} loading={form.isLoading} testID="login-submit" />
          <GlassButton
            variant="plain"
            label="New here? Create a new account"
            disabled={form.isLoading}
            onPress={() => router.push('/register')}
          />
        </>
      }
    >
      <TextField
        label="Username or Email"
        value={form.values.identifier}
        error={form.errors.identifier}
        onChangeText={(t) => form.setField('identifier', t)}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="username"
        autoComplete="username"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => passwordRef.current?.focus()}
        editable={!form.isLoading}
      />
      <TextField
        ref={passwordRef}
        label="Password"
        password
        value={form.values.password}
        error={form.errors.password}
        onChangeText={(t) => form.setField('password', t)}
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="password"
        autoComplete="current-password"
        returnKeyType="go"
        onSubmitEditing={form.onSubmit}
        editable={!form.isLoading}
      />
    </AuthForm>
  );
}

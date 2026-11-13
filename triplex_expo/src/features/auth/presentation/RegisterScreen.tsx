import { useRouter } from 'expo-router';
import { useRef } from 'react';
import type { TextInput } from 'react-native';

import { GlassButton, TextField } from '../../../design-system';
import { useAuthStore } from '../store/authStore';
import { validateRegister } from '../validation/rules';
import { AuthForm } from './AuthForm';
import { useAuthForm } from './useAuthForm';

export function RegisterScreen() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const form = useAuthForm({
    initial: { username: '', email: '', password: '' },
    validate: validateRegister,
    submit: (v) => register({ username: v.username.trim(), email: v.email.trim(), password: v.password }),
  });

  return (
    <AuthForm
      title="Register a new account"
      serverError={form.serverError}
      footer={
        <>
          <GlassButton label="Create" onPress={form.onSubmit} loading={form.isLoading} testID="register-submit" />
          <GlassButton
            variant="plain"
            label="Already have an account? Login"
            disabled={form.isLoading}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/login'))}
          />
        </>
      }
    >
      <TextField
        label="Username"
        value={form.values.username}
        error={form.errors.username}
        onChangeText={(t) => form.setField('username', t)}
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="username"
        autoComplete="username-new"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => emailRef.current?.focus()}
        editable={!form.isLoading}
      />
      <TextField
        ref={emailRef}
        label="Email"
        value={form.values.email}
        error={form.errors.email}
        onChangeText={(t) => form.setField('email', t)}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
        autoComplete="email"
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
        textContentType="newPassword"
        autoComplete="new-password"
        returnKeyType="go"
        onSubmitEditing={form.onSubmit}
        editable={!form.isLoading}
      />
    </AuthForm>
  );
}

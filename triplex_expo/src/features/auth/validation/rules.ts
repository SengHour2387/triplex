/**
 * Client-side form rules. Flutter had none (it sent whatever was typed and showed the server's
 * answer), so these are the backend's documented rules plus the obvious "not empty":
 * usernames are 3–30 letters/digits/underscores (`profile/change_username_invalid_format`).
 * The server stays the authority — these only save a round trip and point at the field.
 */
export const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,30}$/;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 8;

export type FieldErrors<K extends string> = Partial<Record<K, string>>;

export const looksLikeEmail = (value: string): boolean => value.includes('@');

export interface LoginInput {
  identifier: string;
  password: string;
}

export function validateLogin({ identifier, password }: LoginInput): FieldErrors<keyof LoginInput> {
  const errors: FieldErrors<keyof LoginInput> = {};
  const id = identifier.trim();
  if (!id) errors.identifier = 'Enter your username or email.';
  else if (looksLikeEmail(id) && !EMAIL_PATTERN.test(id)) errors.identifier = 'Enter a valid email address.';
  // No length rule on login: an existing account may predate any rule.
  if (!password) errors.password = 'Enter your password.';
  return errors;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export function validateRegister({ username, email, password }: RegisterInput): FieldErrors<keyof RegisterInput> {
  const errors: FieldErrors<keyof RegisterInput> = {};
  if (!USERNAME_PATTERN.test(username.trim())) {
    errors.username = 'Use 3–30 letters, numbers or underscores.';
  }
  if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Enter a valid email address.';
  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return errors;
}

export const hasErrors = (errors: object): boolean => Object.values(errors).some(Boolean);

/** Login accepts either; the backend has a separate endpoint for each. */
export function toLoginCredentials({ identifier, password }: LoginInput) {
  const id = identifier.trim();
  return looksLikeEmail(id) ? { email: id, password } : { username: id, password };
}

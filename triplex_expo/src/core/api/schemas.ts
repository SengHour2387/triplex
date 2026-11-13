import { z } from 'zod';

/**
 * Response shapes at the API boundary (contract: `triplex_node/api_doc.md`).
 * Parsing here means a bad payload becomes an `AppError('invalid_response')` at the edge instead of
 * `undefined is not an object` three screens later.
 *
 * Optional columns use `nullish()` — the backend sends `null` for unset values.
 */
export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
  name: z.string().nullish(),
  phone: z.string().nullish(),
  avatar_url: z.string().nullish(),
  created_at: z.string().nullish(),
  updated_at: z.string().nullish(),
  followersCount: z.number().nullish(),
  followingCount: z.number().nullish(),
});
export type User = z.infer<typeof userSchema>;

/** `POST auth/login`, `auth/login-username`, `auth/register`. */
export const authResponseSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  user: userSchema,
});
export type AuthResponse = z.infer<typeof authResponseSchema>;

/** `POST auth/refresh`. The refresh token is rotated, but tolerate a server that omits it. */
export const refreshResponseSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1).optional(),
});
export type RefreshResponse = z.infer<typeof refreshResponseSchema>;

/** `GET profile/me`. */
export const profileMeResponseSchema = z.object({ user: userSchema });

/**
 * `PUT profile/change-username` and `profile/change-email`. Both bump the account's `token_version`,
 * which revokes the old refresh token — so the new pair is *required*, not optional: dropping it
 * would sign the user out at the next refresh.
 */
export const accountChangeResponseSchema = z.object({
  user: userSchema,
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});
export type AccountChangeResponse = z.infer<typeof accountChangeResponseSchema>;

/** `POST profile/check-username`. */
export const checkUsernameResponseSchema = z.object({ available: z.boolean() });

/** `POST profile/profile-picture`. */
export const avatarUploadResponseSchema = z.object({ avatarUrl: z.string().min(1) });

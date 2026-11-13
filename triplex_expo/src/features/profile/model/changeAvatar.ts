import type { User } from '../../../core/api/schemas';
import { toAppError, type AppError } from '../../../core/errors/appError';
import type { PickResult, AvatarSource } from './pickAvatar';
import type { PreparedImage } from './prepareAvatar';

export type ChangeAvatarResult =
  | { kind: 'updated'; user: User }
  | { kind: 'cancelled' }
  | { kind: 'denied' }
  | { kind: 'unavailable' }
  | { kind: 'failed'; error: AppError };

export interface ChangeAvatarSteps {
  pick: (source: AvatarSource) => Promise<PickResult>;
  prepare: (picked: { uri: string; width: number; height: number }) => Promise<PreparedImage>;
  upload: (file: PreparedImage, onProgress: (percent: number) => void) => Promise<string>;
  onProgress: (percent: number | null) => void;
}

/**
 * Pick → shrink → upload → the user with the new `avatar_url`. Reports progress (`0` while preparing,
 * then 0–100 while uploading, `null` when finished or abandoned — in every outcome). Nothing is
 * thrown: a failure becomes `{ kind: 'failed' }` with a user-safe message.
 */
export async function changeAvatar(source: AvatarSource, current: User, steps: ChangeAvatarSteps): Promise<ChangeAvatarResult> {
  const picked = await steps.pick(source);
  if (picked.kind !== 'picked') return { kind: picked.kind };

  steps.onProgress(0);
  try {
    const file = await steps.prepare(picked);
    const avatarUrl = await steps.upload(file, steps.onProgress);
    return { kind: 'updated', user: { ...current, avatar_url: avatarUrl } };
  } catch (cause) {
    return { kind: 'failed', error: toAppError(cause) };
  } finally {
    steps.onProgress(null);
  }
}

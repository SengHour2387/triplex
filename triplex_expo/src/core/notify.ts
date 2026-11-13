import { toast } from '../design-system';
import type { AppError } from './errors/appError';
import { describeFailure, type FailedAction } from './errors/failureCopy';

const DEDUPE_MS = 2500;
let last: { message: string; at: number } | null = null;

export interface NotifyOptions {
  /** What was being done. Without it the toast shows the error's generic message. */
  action?: FailedAction;
  /** Offered as the toast's "Retry" button — only when the failure was transient (a refused request would be refused again). */
  retry?: () => void;
}

/**
 * Show an error to the user as a toast. Identical messages inside 2.5 s collapse into one, so a
 * screen firing five failing queries doesn't stack five toasts.
 */
export function notifyError(error: AppError, options: NotifyOptions = {}, now: () => number = Date.now): void {
  // The session-ended flow (sign-out + login screen) owns that message.
  if (error.code === 'auth/session_expired') return;

  const { message, retryable } = options.action ? describeFailure(options.action, error) : { message: error.message, retryable: false };
  const at = now();
  if (last && last.message === message && at - last.at < DEDUPE_MS) return;
  last = { message, at };

  const retry = options.retry;
  toast.error(message, retry && retryable ? { actionLabel: 'Retry', onAction: retry } : undefined);
}

/** Test seam. */
export const resetNotifyDedupe = (): void => {
  last = null;
};

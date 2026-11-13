import { isAxiosError } from 'axios';
import { ZodError } from 'zod';

import { messageForCode } from './messages';

export type AppErrorKind =
  | 'network' // no response at all (offline, DNS, connection refused)
  | 'timeout'
  | 'unauthorized' // 401 — session missing/expired
  | 'forbidden' // 403 — the backend's *authorization* failure; never means "refresh the token"
  | 'not_found'
  | 'bad_request' // other 4xx
  | 'server' // 5xx
  | 'invalid_response' // the server answered, but not with the shape we expect
  | 'unknown';

export interface AppErrorInit {
  kind: AppErrorKind;
  /** User-safe text. Never a stack trace, never a raw backend string. */
  message: string;
  /** Backend error code such as `auth/token_revoked`, when there is one. */
  code?: string;
  status?: number;
  cause?: unknown;
}

/** The only error type that is allowed to reach UI code. */
export class AppError extends Error {
  readonly kind: AppErrorKind;
  readonly code?: string;
  readonly status?: number;

  constructor({ kind, message, code, status, cause }: AppErrorInit) {
    super(message, { cause });
    this.name = 'AppError';
    this.kind = kind;
    this.code = code;
    this.status = status;
  }

  /** Worth retrying automatically (transient). 4xx never is. */
  get isTransient(): boolean {
    return this.kind === 'network' || this.kind === 'timeout' || this.kind === 'server';
  }
}

export const isAppError = (value: unknown): value is AppError => value instanceof AppError;

const GENERIC_MESSAGE: Record<AppErrorKind, string> = {
  network: "Can't reach Triplex. Check your connection and try again.",
  timeout: 'The request took too long. Please try again.',
  unauthorized: 'Your session has expired. Please sign in again.',
  forbidden: "You don't have permission to do that.",
  not_found: "We couldn't find what you were looking for.",
  bad_request: 'Something was wrong with that request.',
  server: 'Something went wrong on our side. Please try again.',
  invalid_response: 'We got an unexpected response from the server. Please try again.',
  unknown: 'Something went wrong. Please try again.',
};

export const genericMessage = (kind: AppErrorKind): string => GENERIC_MESSAGE[kind];

function kindForStatus(status: number): AppErrorKind {
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status >= 500) return 'server';
  return 'bad_request';
}

/** Backend codes look like `domain/snake_case`. Anything else (`Failed to log in`) is not shown. */
const CODE_PATTERN = /^[a-z_]+\/[a-z0-9_]+$/;

function codeFromBody(body: unknown): string | undefined {
  if (typeof body !== 'object' || body === null || !('message' in body)) return undefined;
  const { message } = body;
  return typeof message === 'string' && CODE_PATTERN.test(message) ? message : undefined;
}

/**
 * Normalise anything that can be thrown into an `AppError`.
 * Idempotent — an `AppError` comes back unchanged.
 */
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) return error;

  if (isAxiosError(error)) {
    if (!error.response) {
      const timedOut = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';
      const kind = timedOut ? 'timeout' : 'network';
      return new AppError({ kind, message: GENERIC_MESSAGE[kind], code: error.code, cause: error });
    }
    const { status, data } = error.response;
    const kind = kindForStatus(status);
    const code = codeFromBody(data);
    return new AppError({
      kind,
      message: (code && messageForCode(code)) || GENERIC_MESSAGE[kind],
      code,
      status,
      cause: error,
    });
  }

  if (error instanceof ZodError) {
    return new AppError({ kind: 'invalid_response', message: GENERIC_MESSAGE.invalid_response, cause: error });
  }

  return new AppError({ kind: 'unknown', message: GENERIC_MESSAGE.unknown, cause: error });
}

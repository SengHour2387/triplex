import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import { AppError, genericMessage, isAppError, toAppError } from '../errors/appError';
import { logger } from '../logger';
import type { TokenStore } from '../storage/secureStorage';
import { Endpoints } from './endpoints';
import { refreshResponseSchema } from './schemas';

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

export interface AuthInterceptorDeps {
  /** The client the interceptor is installed on; used to replay the failed request. */
  api: AxiosInstance;
  /** A client WITHOUT this interceptor, for the refresh call itself. */
  refreshApi: AxiosInstance;
  tokens: TokenStore;
  /** Called after credentials were wiped because the refresh was rejected. */
  onSessionExpired: () => void;
}

const SESSION_EXPIRED = (cause?: unknown): AppError =>
  new AppError({
    kind: 'unauthorized',
    message: genericMessage('unauthorized'),
    code: 'auth/session_expired',
    status: 401,
    cause,
  });

const isRefreshCall = (config: InternalAxiosRequestConfig): boolean =>
  config.url?.includes(Endpoints.auth.refresh) ?? false;

/** The refresh token itself was refused — the only case that ends the session. */
const isRefreshRejection = (error: AppError): boolean =>
  error.status === 401 || error.status === 403;

/**
 * Installs token handling on `api`:
 *
 * - **Request:** attach `Authorization: Bearer <access>` unless the caller set one.
 * - **Response:** every failure leaves as an `AppError`. A **401** on a normal call triggers ONE
 *   refresh (shared by all concurrent 401s) and ONE replay. **403 never refreshes** — the backend
 *   uses it for real permission errors (`comment/unauthorized`, ownership checks).
 * - **Refresh outcome:** rejected by the server (401/403) → wipe credentials, end the session.
 *   Anything else (offline, timeout, 5xx, bad body) → keep the session and surface the error, so a
 *   subway tunnel never signs anyone out.
 */
export function installAuthInterceptor({ api, refreshApi, tokens, onSessionExpired }: AuthInterceptorDeps): void {
  /** Single-flight: every request that 401s while a refresh is running awaits this same promise. */
  let inflight: Promise<string> | null = null;

  async function refreshAccessToken(): Promise<string> {
    const refreshToken = await tokens.getRefreshToken();
    if (!refreshToken) {
      await endSession();
      throw SESSION_EXPIRED();
    }

    try {
      const response = await refreshApi.post<unknown>(Endpoints.auth.refresh, { refreshToken });
      const parsed = refreshResponseSchema.safeParse(response.data);
      if (!parsed.success) {
        logger.error('[auth] refresh returned an unexpected shape', parsed.error.issues);
        throw new AppError({
          kind: 'invalid_response',
          message: genericMessage('invalid_response'),
          status: response.status,
          cause: parsed.error,
        });
      }
      await tokens.setTokens(parsed.data.accessToken, parsed.data.refreshToken);
      return parsed.data.accessToken;
    } catch (error) {
      const appError = toAppError(error);
      if (isRefreshRejection(appError)) {
        await endSession();
        throw SESSION_EXPIRED(appError);
      }
      logger.warn(`[auth] refresh failed (${appError.kind}); keeping the session`);
      throw appError;
    }
  }

  async function endSession(): Promise<void> {
    await tokens.clear();
    onSessionExpired();
  }

  function refreshOnce(): Promise<string> {
    inflight ??= refreshAccessToken().finally(() => {
      inflight = null;
    });
    return inflight;
  }

  api.interceptors.request.use(async (config) => {
    if (!config.headers.Authorization) {
      const accessToken = await tokens.getAccessToken();
      if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  api.interceptors.response.use(undefined, async (error: AxiosError | AppError) => {
    if (isAppError(error)) throw error;

    const config = error.config as RetriableConfig | undefined;
    const isUnauthorized = error.response?.status === 401;

    // 403 and everything else: a normal error. A call that already had its one retry stops here.
    if (!config || !isUnauthorized || isRefreshCall(config) || config._retried) {
      throw toAppError(error);
    }
    config._retried = true;

    // If a refresh already finished while this response was in flight, the stored token is newer
    // than the one this request used — replay with it instead of refreshing a second time.
    const sentWith = /^Bearer (.+)$/.exec(String(config.headers.Authorization ?? ''))?.[1];
    const stored = await tokens.getAccessToken();
    const token = stored && stored !== sentWith ? stored : await refreshOnce();

    config.headers.Authorization = `Bearer ${token}`;
    return api.request(config);
  });
}

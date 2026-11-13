import axios, { type AxiosInstance } from 'axios';

import { Env } from '../../config/env';
import { sessionEvents } from '../auth/sessionEvents';
import { secureStorage } from '../storage/secureStorage';
import { installAuthInterceptor } from './authInterceptor';

export const createHttpClient = (): AxiosInstance =>
  // eslint-disable-next-line import/no-named-as-default-member -- `axios.create` is axios's documented API
  axios.create({
    baseURL: Env.baseUrl,
    timeout: Env.timeoutMs,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  });

/** Used only for `auth/refresh` — it has no interceptor, so a refresh can never trigger a refresh. */
const refreshApi = createHttpClient();

/** The application client. Every error it throws is an `AppError`. */
export const apiClient = createHttpClient();

installAuthInterceptor({
  api: apiClient,
  refreshApi,
  tokens: secureStorage,
  onSessionExpired: sessionEvents.emitExpired,
});

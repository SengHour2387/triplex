import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

import { type AppError, toAppError } from '../errors/appError';
import { notifyError } from '../notify';

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: AppError;
    queryMeta: { /** Don't toast this query's background-refetch failures. */ silent?: boolean };
    mutationMeta: { /** Don't toast this mutation's failure (the screen shows it inline). */ silent?: boolean };
  }
}

export const MAX_QUERY_RETRIES = 2;

/** Transient failures retry (twice); 4xx never does — repeating a rejected request can't help. */
export const shouldRetry = (failureCount: number, error: unknown): boolean =>
  failureCount < MAX_QUERY_RETRIES && toAppError(error).isTransient;

/** 1 s, 2 s … capped at 10 s. */
export const retryDelay = (attempt: number): number => Math.min(1000 * 2 ** attempt, 10_000);

export interface QueryClientOptions {
  notify?: (error: AppError) => void;
}

/**
 * Error → toast policy:
 * - **Queries** toast only when there is already data on screen (a *background* refetch failed).
 *   A failed first load is rendered by the screen itself (`isError` → empty/error state); a toast
 *   on top of that would say the same thing twice.
 * - **Mutations** toast unless `meta: { silent: true }` (e.g. a form that shows its own inline error).
 */
export function createQueryClient({ notify = notifyError }: QueryClientOptions = {}): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (query.state.data !== undefined && !query.meta?.silent) notify(toAppError(error));
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (!mutation.meta?.silent) notify(toAppError(error));
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: shouldRetry,
        retryDelay,
        refetchOnWindowFocus: true, // "focus" = app foregrounded, see managers.ts
        refetchOnReconnect: true,
      },
      mutations: {
        retry: false, // a retried POST can double-post; the user can tap again
        // Don't pause while offline: a paused mutation spins until the network returns and then fires
        // unannounced. Failing at once lets the toast say what failed, offer Retry and keep the user's text.
        networkMode: 'always',
      },
    },
  });
}

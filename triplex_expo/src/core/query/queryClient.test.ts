import type { QueryClient } from '@tanstack/react-query';

import { AppError } from '../errors/appError';
import { MAX_QUERY_RETRIES, createQueryClient, retryDelay, shouldRetry } from './queryClient';

const err = (kind: AppError['kind']) => new AppError({ kind, message: `${kind} message` });

describe('retry policy', () => {
  it.each(['network', 'timeout', 'server'] as const)('retries transient %s errors, up to the cap', (kind) => {
    expect(shouldRetry(0, err(kind))).toBe(true);
    expect(shouldRetry(MAX_QUERY_RETRIES - 1, err(kind))).toBe(true);
    expect(shouldRetry(MAX_QUERY_RETRIES, err(kind))).toBe(false);
  });

  it.each(['unauthorized', 'forbidden', 'not_found', 'bad_request', 'invalid_response', 'unknown'] as const)(
    'never retries %s',
    (kind) => expect(shouldRetry(0, err(kind))).toBe(false),
  );

  it('backs off exponentially, capped at 10 s', () => {
    expect([0, 1, 2, 3, 10].map(retryDelay)).toEqual([1000, 2000, 4000, 8000, 10_000]);
  });

  it('mutations are never retried', () => {
    expect(createQueryClient().getDefaultOptions().mutations?.retry).toBe(false);
  });

  it('mutations fail at once offline instead of pausing', () => {
    expect(createQueryClient().getDefaultOptions().mutations?.networkMode).toBe('always');
  });
});

describe('error → toast bridge', () => {
  // Each client schedules cache-expiry timers; clear them so Jest can exit cleanly.
  const clients: QueryClient[] = [];
  const makeClient = (options: Parameters<typeof createQueryClient>[0]) => {
    const client = createQueryClient(options);
    clients.push(client);
    return client;
  };
  afterEach(() => clients.splice(0).forEach((client) => client.clear()));

  const run = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
    } catch {
      /* expected */
    }
  };

  it('does NOT toast a failed first load — the screen renders that itself', async () => {
    const notify = jest.fn();
    const client = makeClient({ notify });
    await run(() => client.fetchQuery({ queryKey: ['a'], queryFn: () => Promise.reject(err('server')), retry: false }));
    expect(notify).not.toHaveBeenCalled();
  });

  it('toasts when a background refetch fails and stale data is on screen', async () => {
    const notify = jest.fn();
    const client = makeClient({ notify });
    client.setQueryData(['a'], 'cached');
    await run(() => client.fetchQuery({ queryKey: ['a'], staleTime: 0, queryFn: () => Promise.reject(err('network')), retry: false }));
    expect(notify).toHaveBeenCalledTimes(1);
    expect(notify.mock.calls[0][0].message).toBe('network message');
  });

  it('respects meta.silent on queries', async () => {
    const notify = jest.fn();
    const client = makeClient({ notify });
    client.setQueryData(['a'], 'cached');
    await run(() =>
      client.fetchQuery({ queryKey: ['a'], staleTime: 0, meta: { silent: true }, queryFn: () => Promise.reject(err('network')), retry: false }),
    );
    expect(notify).not.toHaveBeenCalled();
  });

  it('toasts mutation failures, normalising non-AppErrors', async () => {
    const notify = jest.fn();
    const client = makeClient({ notify });
    await run(() => client.getMutationCache().build(client, { gcTime: Infinity, mutationFn: () => Promise.reject(new TypeError('x')) }).execute(undefined));
    expect(notify).toHaveBeenCalledTimes(1);
    expect(notify.mock.calls[0][0]).toBeInstanceOf(AppError);
  });

  it('respects meta.silent on mutations', async () => {
    const notify = jest.fn();
    const client = makeClient({ notify });
    await run(() =>
      client.getMutationCache().build(client, { gcTime: Infinity, meta: { silent: true }, mutationFn: () => Promise.reject(err('forbidden')) }).execute(undefined),
    );
    expect(notify).not.toHaveBeenCalled();
  });
});

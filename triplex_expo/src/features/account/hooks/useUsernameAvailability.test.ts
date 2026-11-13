import { act, renderHook } from '@testing-library/react-native';

import { AccountApi } from '../api/accountApi';
import { AVAILABILITY_DEBOUNCE_MS, useUsernameAvailability } from './useUsernameAvailability';

jest.mock('../api/accountApi');
const api = jest.mocked(AccountApi);

/** A request the test resolves by hand, so answers can arrive out of order. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => ((resolve = res), (reject = rej)));
  return { promise, resolve, reject };
}

const advance = (ms: number) => act(async () => void (await jest.advanceTimersByTimeAsync(ms)));

beforeEach(() => {
  jest.useFakeTimers();
  jest.resetAllMocks();
});
afterEach(() => jest.useRealTimers());

const run = (value: string, current = 'jo_doe') => renderHook(({ v }: { v: string }) => useUsernameAvailability(v, current), { initialProps: { v: value } });

describe('useUsernameAvailability', () => {
  it('is idle for an empty box and for the current name — and asks nothing', async () => {
    const { result, rerender } = await run('');
    expect(result.current).toBe('idle');
    await rerender({ v: ' jo_doe ' });
    await advance(1000);
    expect(result.current).toBe('idle');
    expect(api.isUsernameAvailable).not.toHaveBeenCalled();
  });

  it('is invalid immediately for a bad name, with no request', async () => {
    const { result } = await run('a!');
    expect(result.current).toBe('invalid');
    await advance(1000);
    expect(api.isUsernameAvailable).not.toHaveBeenCalled();
  });

  it('reports checking at once, but only calls the server after 400 ms of quiet', async () => {
    api.isUsernameAvailable.mockResolvedValue(true);
    const { result } = await run('new_name');
    expect(result.current).toBe('checking');
    await advance(AVAILABILITY_DEBOUNCE_MS - 1);
    expect(api.isUsernameAvailable).not.toHaveBeenCalled();
    await advance(1);
    expect(api.isUsernameAvailable).toHaveBeenCalledTimes(1);
    expect(api.isUsernameAvailable).toHaveBeenCalledWith('new_name', expect.any(AbortSignal));
    expect(result.current).toBe('available');
  });

  it('typing again restarts the clock: a burst of keystrokes makes ONE request, for the last value', async () => {
    api.isUsernameAvailable.mockResolvedValue(false);
    const { result, rerender } = await run('abc');
    await advance(300);
    await rerender({ v: 'abcd' });
    await advance(300);
    await rerender({ v: 'abcde' });
    await advance(AVAILABILITY_DEBOUNCE_MS);
    expect(api.isUsernameAvailable).toHaveBeenCalledTimes(1);
    expect(api.isUsernameAvailable).toHaveBeenCalledWith('abcde', expect.any(AbortSignal));
    expect(result.current).toBe('taken');
  });

  it('STALE ANSWER: a slow reply for the old name cannot overwrite the newer name', async () => {
    const slow = deferred<boolean>();
    const fast = deferred<boolean>();
    api.isUsernameAvailable.mockReturnValueOnce(slow.promise).mockReturnValueOnce(fast.promise);

    const { result, rerender } = await run('jo');
    await rerender({ v: 'jon' }); // "jo" is invalid locally → no request; use valid names instead
    expect(api.isUsernameAvailable).not.toHaveBeenCalled();

    await rerender({ v: 'joe' });
    await advance(AVAILABILITY_DEBOUNCE_MS); // request #1 for "joe" starts
    await rerender({ v: 'joel' });
    await advance(AVAILABILITY_DEBOUNCE_MS); // request #2 for "joel" starts
    expect(api.isUsernameAvailable).toHaveBeenCalledTimes(2);

    await act(async () => fast.resolve(true)); // "joel" answers first: available
    expect(result.current).toBe('available');
    await act(async () => slow.resolve(false)); // the old "joe" answer ("taken") arrives late
    expect(result.current).toBe('available'); // …and is ignored
  });

  it('an old failure is ignored too (aborted request must not flip the status to unverified)', async () => {
    const first = deferred<boolean>();
    api.isUsernameAvailable.mockReturnValueOnce(first.promise).mockResolvedValueOnce(true);
    const { result, rerender } = await run('joe');
    await advance(AVAILABILITY_DEBOUNCE_MS);
    await rerender({ v: 'joel' });
    await advance(AVAILABILITY_DEBOUNCE_MS);
    await act(async () => first.reject(new Error('aborted')));
    expect(result.current).toBe('available');
  });

  it('says unverified — not taken — when the check itself fails', async () => {
    api.isUsernameAvailable.mockRejectedValue(new Error('offline'));
    const { result } = await run('new_name');
    await advance(AVAILABILITY_DEBOUNCE_MS);
    expect(result.current).toBe('unverified');
  });

  it('aborts the request in flight when the name changes', async () => {
    const signals: AbortSignal[] = [];
    api.isUsernameAvailable.mockImplementation((_name, signal) => (signal && signals.push(signal), new Promise<boolean>(() => {})));
    const { rerender } = await run('joe');
    await advance(AVAILABILITY_DEBOUNCE_MS);
    await rerender({ v: 'joel' });
    expect(signals[0]?.aborted).toBe(true);
  });
});

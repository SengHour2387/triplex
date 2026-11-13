import { toast, toastDisplayMs, TOAST_MS, TOAST_WITH_ACTION_MS, useToastStore } from './toastStore';

beforeEach(() => {
  useToastStore.setState({ current: null });
});

describe('toast', () => {
  it('starts empty', () => {
    expect(useToastStore.getState().current).toBeNull();
  });

  it.each([
    ['success', 'success'],
    ['error', 'error'],
    ['warning', 'warning'],
    ['info', 'info'],
  ] as const)('toast.%s sets kind %s', (method, kind) => {
    toast[method]('Saved');
    expect(useToastStore.getState().current).toMatchObject({ message: 'Saved', kind });
  });

  it('defaults to info', () => {
    toast.show('Hello');
    expect(useToastStore.getState().current?.kind).toBe('info');
  });

  it('carries an action', () => {
    const onAction = jest.fn();
    toast.error('Upload failed', { actionLabel: 'Retry', onAction });
    const current = useToastStore.getState().current;
    expect(current?.actionLabel).toBe('Retry');
    current?.onAction?.();
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('replaces the current toast', () => {
    toast.info('first');
    toast.warning('second');
    expect(useToastStore.getState().current).toMatchObject({ message: 'second', kind: 'warning' });
  });

  it('gives identical messages different ids so the same text re-triggers', () => {
    toast.info('same');
    const first = useToastStore.getState().current?.id;
    toast.info('same');
    expect(useToastStore.getState().current?.id).not.toBe(first);
  });

  it('dismiss clears it', () => {
    toast.success('done');
    toast.dismiss();
    expect(useToastStore.getState().current).toBeNull();
  });
});

describe('toastDisplayMs', () => {
  it('keeps a toast with a button on screen longer than a plain one', () => {
    expect(toastDisplayMs({})).toBe(TOAST_MS);
    expect(toastDisplayMs({ actionLabel: 'Retry' })).toBe(TOAST_WITH_ACTION_MS);
    expect(TOAST_WITH_ACTION_MS).toBeGreaterThan(TOAST_MS);
  });
});

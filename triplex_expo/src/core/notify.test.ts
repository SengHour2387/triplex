import { toast, useToastStore } from '../design-system';
import { AppError, type AppErrorKind } from './errors/appError';
import { notifyError, resetNotifyDedupe } from './notify';

const error = (message: string, code?: string) => new AppError({ kind: 'server', message, code });

beforeEach(() => {
  resetNotifyDedupe();
  toast.dismiss();
});

describe('notifyError', () => {
  it('shows the AppError message as an error toast', () => {
    notifyError(error('Something broke'));
    expect(useToastStore.getState().current).toMatchObject({ message: 'Something broke', kind: 'error' });
  });

  it('collapses identical messages inside the dedupe window, but not different ones or later repeats', () => {
    notifyError(error('Offline'), {}, () => 0);
    const first = useToastStore.getState().current?.id;

    notifyError(error('Offline'), {}, () => 1000);
    expect(useToastStore.getState().current?.id).toBe(first);

    notifyError(error('Other'), {}, () => 1100);
    expect(useToastStore.getState().current?.message).toBe('Other');

    notifyError(error('Other'), {}, () => 1100 + 2500);
    expect(useToastStore.getState().current?.id).not.toBe(first);
  });

  it('stays silent for session expiry — the sign-out flow owns that message', () => {
    notifyError(error('Session expired', 'auth/session_expired'));
    expect(useToastStore.getState().current).toBeNull();
  });

  describe('with an action', () => {
    const failure = (kind: AppErrorKind) => new AppError({ kind, message: 'generic' });
    const action = { what: 'save your reaction', outcome: 'Your reaction was taken back.' };

    it('says what failed and what became of the work, and offers Retry for a transient failure', () => {
      const retry = jest.fn();
      notifyError(failure('network'), { action, retry });
      const current = useToastStore.getState().current;
      expect(current).toMatchObject({ kind: 'error', message: "Couldn't save your reaction. Check your connection. Your reaction was taken back.", actionLabel: 'Retry' });
      current?.onAction?.();
      expect(retry).toHaveBeenCalledTimes(1);
    });

    it('offers no Retry for a refusal — it would only be refused again', () => {
      notifyError(failure('not_found'), { action, retry: jest.fn() });
      expect(useToastStore.getState().current?.actionLabel).toBeUndefined();
    });

    it('offers no Retry when the caller has none (the screen has its own button)', () => {
      notifyError(failure('network'), { action });
      expect(useToastStore.getState().current?.actionLabel).toBeUndefined();
    });
  });
});

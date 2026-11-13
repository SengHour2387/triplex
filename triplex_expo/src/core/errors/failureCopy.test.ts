import { AppError, type AppErrorKind } from './appError';
import { describeFailure } from './failureCopy';

const error = (kind: AppErrorKind, message = 'x') => new AppError({ kind, message });
const action = { what: 'save your reaction', outcome: 'Your reaction was taken back.' };

describe('describeFailure', () => {
  it.each([
    ['network', "Couldn't save your reaction. Check your connection. Your reaction was taken back."],
    ['timeout', "Couldn't save your reaction. The request took too long. Your reaction was taken back."],
    ['server', "Couldn't save your reaction. Something went wrong on our side. Your reaction was taken back."],
  ] as const)('%s: names the cause, says what became of the work, and offers retry', (kind, message) => {
    expect(describeFailure(action, error(kind))).toEqual({ message, retryable: true });
  });

  it("keeps the server's own explanation for a refusal, and does not offer retry", () => {
    expect(describeFailure(action, error('not_found', 'That post is no longer available.'))).toEqual({
      message: 'That post is no longer available. Your reaction was taken back.',
      retryable: false,
    });
  });

  it('omits the outcome when there is none', () => {
    expect(describeFailure({ what: 'repost' }, error('network')).message).toBe("Couldn't repost. Check your connection.");
  });
});

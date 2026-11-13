import type { AppError } from './appError';

export interface FailedAction {
  /** What the user was doing, as the end of "Couldn't …": "save your reaction". */
  what: string;
  /** What happened to their work, said right after: "Your reaction was taken back." Reassurance comes first. */
  outcome?: string;
}

export interface FailureCopy {
  message: string;
  /** Trying again can help (the failure was transient). A refused request (4xx) will be refused again. */
  retryable: boolean;
}

/**
 * The toast text for a failed action: what failed, why in plain words, and what became of the user's
 * work. Transient failures name the cause; a refusal keeps the server's own explanation ("That post is no
 * longer available.") because that, not "check your connection", is what the user needs to hear.
 */
export function describeFailure(action: FailedAction, error: AppError): FailureCopy {
  const outcome = action.outcome ? ` ${action.outcome}` : '';
  switch (error.kind) {
    case 'network':
      return { message: `Couldn't ${action.what}. Check your connection.${outcome}`, retryable: true };
    case 'timeout':
      return { message: `Couldn't ${action.what}. The request took too long.${outcome}`, retryable: true };
    case 'server':
      return { message: `Couldn't ${action.what}. Something went wrong on our side.${outcome}`, retryable: true };
    default:
      return { message: `${error.message}${outcome}`, retryable: false };
  }
}

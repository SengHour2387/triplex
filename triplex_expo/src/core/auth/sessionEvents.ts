type Listener = () => void;

/**
 * The API layer must be able to say "the session is over" without importing the auth feature
 * (that would be a cycle: auth → api → auth). The auth store subscribes; the interceptor emits.
 */
const expiredListeners = new Set<Listener>();

export const sessionEvents = {
  onExpired(listener: Listener): () => void {
    expiredListeners.add(listener);
    return () => {
      expiredListeners.delete(listener);
    };
  },
  emitExpired(): void {
    expiredListeners.forEach((listener) => listener());
  },
};

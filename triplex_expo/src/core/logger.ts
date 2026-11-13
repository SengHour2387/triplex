type Level = 'debug' | 'info' | 'warn' | 'error';

/** Receives warn/error entries in every build — the hook for a crash reporter later. */
export type LogSink = (level: 'warn' | 'error', message: string, context?: unknown) => void;

let sink: LogSink | null = null;

export const setLogSink = (next: LogSink | null): void => {
  sink = next;
};

function write(level: Level, message: string, context?: unknown): void {
  // Release builds drop debug/info; warn/error go to the sink only (no console noise for users).
  if (level === 'warn' || level === 'error') sink?.(level, message, context);
  if (!__DEV__) return;
  const args = context === undefined ? [message] : [message, context];
  console[level](...args);
}

/** Never pass tokens, passwords or full request bodies as `context`. */
export const logger = {
  debug: (message: string, context?: unknown) => write('debug', message, context),
  info: (message: string, context?: unknown) => write('info', message, context),
  warn: (message: string, context?: unknown) => write('warn', message, context),
  error: (message: string, context?: unknown) => write('error', message, context),
};

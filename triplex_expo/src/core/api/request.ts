import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { z } from 'zod';

import { AppError, genericMessage } from '../errors/appError';
import { logger } from '../logger';

/**
 * Send a request and validate the body. Resolves to the parsed (typed) data, or rejects with an
 * `AppError` — transport failures are already normalised by the client's interceptor; a body that
 * does not match `schema` becomes `invalid_response`.
 */
export async function send<S extends z.ZodType>(
  client: AxiosInstance,
  config: AxiosRequestConfig,
  schema: S,
): Promise<z.infer<S>> {
  const response = await client.request<unknown>(config);
  const parsed = schema.safeParse(response.data);
  if (!parsed.success) {
    logger.error(`[api] ${config.method ?? 'get'} ${config.url ?? ''} returned an unexpected shape`, parsed.error.issues);
    throw new AppError({
      kind: 'invalid_response',
      message: genericMessage('invalid_response'),
      status: response.status,
      cause: parsed.error,
    });
  }
  return parsed.data;
}

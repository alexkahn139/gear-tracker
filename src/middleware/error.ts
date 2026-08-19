import type { ErrorHandler, NotFoundHandler } from 'hono';
import { AppError } from '../lib/errors.js';
import type { AppEnv } from '../env.js';

/**
 * Hono global error handler. Register with `app.onError(handler())`.
 *
 * Handles:
 *  - {@link AppError} subclasses → their status + message (+ optional `details`)
 *  - {@link SyntaxError} → 400 "Malformed JSON body"
 *  - anything else → 500 with the message
 */
export function errorHandler(opts?: { debug?: boolean }): ErrorHandler<AppEnv> {
  return (err, c): Response => {
    if (err instanceof AppError) {
      const body: Record<string, unknown> = { error: err.message };
      if (err.details !== undefined) body.details = err.details;
      const status = err.status as 400 | 401 | 404 | 409 | 500;
      return c.json(body, status);
    }
    if (err instanceof SyntaxError) {
      return c.json({ error: 'Malformed JSON body' }, 400);
    }
    if (opts?.debug && err instanceof Error) {
      console.error(err);
    }
    const message = err instanceof Error ? err.message : String(err);
    return c.json({ error: message }, 500);
  };
}

/** 404 fallback for any unmatched route. */
export function notFoundHandler(): NotFoundHandler<AppEnv> {
  return (c) => c.json({ error: 'Not found' }, 404);
}

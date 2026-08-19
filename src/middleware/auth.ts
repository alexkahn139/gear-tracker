import { getCookie } from 'hono/cookie';
import type { Context, MiddlewareHandler } from 'hono';
import { getSqlite } from '../db/index.js';
import { getStore } from './session.js';
import type { AppEnv } from '../env.js';

export const SESSION_COOKIE = 'session_id';

const USER_SELECT = 'SELECT id, name, email, phone FROM users WHERE id = ?';

/**
 * Require a valid session. On success, attaches the user to the typed
 * context via `c.set('user', ...)` / `c.set('userId', ...)`.
 * Fails with `401 { error: 'Unauthorized' }`.
 */
export function requireAuth(): MiddlewareHandler<AppEnv> {
  return async (c: Context<AppEnv>, next) => {
    const token = getCookie(c, SESSION_COOKIE);
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    const userId = getStore().get(token);
    if (userId === undefined) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    const row = getSqlite().prepare(USER_SELECT).get(userId) as
      | { id: number; name: string; email: string; phone: string | null }
      | undefined;
    if (!row) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    c.set('user', {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone ?? undefined,
    });
    c.set('userId', row.id);
    await next();
    return c.body(null);
  };
}

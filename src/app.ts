import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { authRoutes } from './routes/auth.js';
import type { AppEnv } from './env.js';

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const WEB_DIST = path.resolve(PROJECT_ROOT, 'web', 'dist');

/**
 * Build the Hono app. Factored out so tests can call `createApp()` and
 * drive requests via `app.request(...)` without opening a port.
 */
export function createApp(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();

  app.onError(errorHandler());

  app.get('/api/health', (c) => c.json({ data: { status: 'ok' } }));

  // Mount auth routes at /api/auth/{register, login, logout, me}.
  app.route('/api/auth', authRoutes);

  // Fall-through for the built SPA.
  if (existsSync(WEB_DIST)) {
    const spa = serveStatic<AppEnv>({ root: WEB_DIST });
    app.on(['GET', 'HEAD'], '/{...path}', (c, next) => spa(c, next));
  }

  app.notFound(notFoundHandler());

  return app;
}

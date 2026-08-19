import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { requireAuth } from './middleware/auth.js';
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

  // Placeholder to prove typed context + middleware end-to-end.
  // Will be replaced by src/routes/auth.ts in task 1.4.
  app.get('/api/auth/me', requireAuth(), (c) => c.json({ data: c.get('user') }));

  // Fall-through for the built SPA.
  if (existsSync(WEB_DIST)) {
    const spa = serveStatic<AppEnv>({ root: WEB_DIST });
    app.on(['GET', 'HEAD'], '/{...path}', (c, next) => spa(c, next));
  }

  app.notFound(notFoundHandler());

  return app;
}

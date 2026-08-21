import { serve } from '@hono/node-server';
import { createApp } from './app.js';
import { openDatabase } from './db/index.js';
import { runMigrations } from './db/migrate.js';

const PORT = Number(process.env.PORT ?? 3000);

openDatabase();
// Migrations are idempotent (IF NOT EXISTS), so run them unconditionally.
runMigrations();

const app = createApp();

serve(
  { fetch: app.fetch, port: PORT },
  (info) => {
    console.log(`Gear Tracker listening on :${info.port}`);
  },
);

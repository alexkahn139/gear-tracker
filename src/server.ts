import { serve } from '@hono/node-server';
import { createApp } from './app.js';
import { openDatabase } from './db/index.js';
import { runMigrations } from './db/migrate.js';

const PORT = Number(process.env.PORT ?? 3000);
const NODE_ENV = process.env.NODE_ENV ?? 'development';

openDatabase();
if (NODE_ENV === 'production' || process.env.RUN_MIGRATIONS === 'true') {
  runMigrations();
}

const app = createApp();

serve(
  { fetch: app.fetch, port: PORT },
  (info) => {
    console.log(`Gear Tracker listening on :${info.port}`);
  },
);

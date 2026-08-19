import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from '../db/schema.js';
import { openDatabase, replaceDatabase, closeDatabase } from '../db/index.js';
import { MemorySessionStore, replaceStore } from '../middleware/session.js';
import { runMigrations } from '../db/migrate.js';
import { createApp } from '../app.js';
import type { Hono } from 'hono';
import type { AppEnv } from '../env.js';

export type TestFixture = {
  app: Hono<AppEnv>;
  sqlite: Database.Database;
  db: BetterSQLite3Database<typeof schema>;
  store: MemorySessionStore;
};

/**
 * Build a fully isolated app + in-memory database.
 * Each call yields a fresh store, database, and migrations.
 * Tests should call this in `beforeEach`.
 */
export function createTestApp(): TestFixture {
  const sqlite = new Database(':memory:');
  sqlite.pragma('foreign_keys = ON');
  const db = drizzle(sqlite, { schema });
  replaceDatabase({ sqlite, db });
  runMigrations();
  const store = new MemorySessionStore();
  replaceStore(store);
  const app = createApp();
  return { app, sqlite, db, store };
}

/** Tear down the active test database (idempotent). */
export function closeTestApp(): void {
  closeDatabase();
}

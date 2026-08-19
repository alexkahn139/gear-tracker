import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';

export type Db = BetterSQLite3Database<typeof schema>;
export type Pair = { sqlite: Database.Database; db: Db };

const THIS_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(THIS_DIR, '..', '..');

let current: Pair | null = null;

function defaultPath(): string {
  const dataDir = process.env.DATA_DIR ?? path.resolve(PROJECT_ROOT, 'data');
  const dbPath = process.env.DB_PATH ?? path.resolve(dataDir, 'gear.db');
  mkdirSync(path.dirname(dbPath), { recursive: true });
  return dbPath;
}

/**
 * Open (or return the existing) database. Idempotent.
 */
export function openDatabase(opts?: { path?: string }): Pair {
  if (current) return current;
  const path_ = opts?.path ?? defaultPath();
  const sqlite = new Database(path_);
  sqlite.pragma('foreign_keys = ON');
  if (path_ !== ':memory:') sqlite.pragma('journal_mode = WAL');
  current = { sqlite, db: drizzle(sqlite, { schema }) };
  return current;
}

/** Swap the active database. Closes the previous connection. Used by tests. */
export function replaceDatabase(pair: Pair): void {
  current?.sqlite.close();
  current = pair;
}

/** Close and invalidate the active database. */
export function closeDatabase(): void {
  current?.sqlite.close();
  current = null;
}

/** Get the active db, opening on demand. */
export function getDb(): Db {
  return (current ?? openDatabase()).db;
}

/** Get the active better-sqlite3 handle, opening on demand. */
export function getSqlite(): Database.Database {
  return (current ?? openDatabase()).sqlite;
}

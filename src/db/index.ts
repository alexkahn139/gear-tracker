import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';

// Anchor to repo root so the DB lands at gear-tracker/data/gear.db
// regardless of the current working directory.
const THIS_DIR = path.dirname(fileURLToPath(import.meta.url)); // .../src/db
const PROJECT_ROOT = path.resolve(THIS_DIR, '..', '..');

const DATA_DIR = process.env.DATA_DIR ?? path.resolve(PROJECT_ROOT, 'data');
const DB_PATH = process.env.DB_PATH ?? path.resolve(DATA_DIR, 'gear.db');

mkdirSync(DATA_DIR, { recursive: true });

const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });
export { sqlite, DB_PATH, DATA_DIR };

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getSqlite, openDatabase } from './index.js';

const THIS_DIR = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.resolve(THIS_DIR, '../migrations');

export function runMigrations(): number {
  if (!existsSync(MIGRATIONS_DIR)) return 0;
  const sqlite = getSqlite();
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();
  const tx = sqlite.transaction(() => {
    for (const f of files) {
      sqlite.exec(readFileSync(path.join(MIGRATIONS_DIR, f), 'utf8'));
    }
  });
  tx();
  return files.length;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  openDatabase();
  const n = runMigrations();
  console.log(`Applied ${n} migration file(s) from ${MIGRATIONS_DIR}`);
}

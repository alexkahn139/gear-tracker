import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { sqlite } from './index.js';

const MIGRATIONS_DIR = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  '../migrations',
);

export function runMigrations(): void {
  if (!existsSync(MIGRATIONS_DIR)) return;

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  const tx = sqlite.transaction(() => {
    for (const file of files) {
      const sqlText = readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
      sqlite.exec(sqlText);
    }
  });
  tx();
}

// Auto-run migrations when executed directly.
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
  console.log(`Applied ${readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).length} migration file(s) from ${MIGRATIONS_DIR}`);
}

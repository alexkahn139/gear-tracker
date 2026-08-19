import { randomUUID } from 'node:crypto';

export type SessionMap = ReadonlyMap<string, number>;

export class MemorySessionStore {
  private readonly map = new Map<string, number>();

  set(userId: number): string {
    const token = randomUUID();
    this.map.set(token, userId);
    return token;
  }

  get(token: string): number | undefined {
    return this.map.get(token);
  }

  delete(token: string): void {
    this.map.delete(token);
  }

  get size(): number {
    return this.map.size;
  }
}

let defaultStore: MemorySessionStore = new MemorySessionStore();

export function getStore(): MemorySessionStore {
  return defaultStore;
}

/** Replace the default store (used by tests for isolation). */
export function replaceStore(store: MemorySessionStore): void {
  defaultStore = store;
}

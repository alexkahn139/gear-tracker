import { hash as argon2Hash, verify as argon2Verify } from 'argon2';
import { randomBytes } from 'node:crypto';

const ARGON2_OPTS = { type: 2 /* argon2id */ } as const;

export async function hashPassword(plain: string): Promise<string> {
  return argon2Hash(plain, ARGON2_OPTS);
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  return argon2Verify(hash, plain);
}

/** 16-char lowercase hex token, per CONTEXT.md §Invariants. */
export function generateShareToken(): string {
  return randomBytes(8).toString('hex');
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmail(value: string): boolean {
  return EMAIL_RE.test(value);
}

export function passwordStrongEnough(value: string): boolean {
  return typeof value === 'string' && value.length >= 8;
}

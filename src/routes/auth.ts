import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { Hono } from 'hono';
import type { Context } from 'hono';
import { eq } from 'drizzle-orm';
import { users, type UserRow } from '../db/schema.js';
import { getDb } from '../db/index.js';
import { getStore } from '../middleware/session.js';
import { requireAuth } from '../middleware/auth.js';
import { BadRequestError, ConflictError, UnauthorizedError } from '../lib/errors.js';
import { hashPassword, verifyPassword, isEmail, passwordStrongEnough } from '../lib/utils.js';
import type { AppEnv } from '../env.js';
import type { User } from '../types.js';

export const authRoutes = new Hono<AppEnv>();

type UserDto = User;

function toUserDto(row: UserRow): UserDto {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? undefined,
  };
}

function setSessionCookie(c: Context<AppEnv>, token: string): void {
  setCookie(c, 'session_id', token, {
    httpOnly: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
}

async function readJsonObject(c: Context<AppEnv>): Promise<Record<string, unknown>> {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    throw new BadRequestError('request body must be JSON');
  }
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new BadRequestError('request body must be a JSON object');
  }
  return body as Record<string, unknown>;
}

/** POST /api/auth/register */
authRoutes.post('/register', async (c: Context<AppEnv>): Promise<Response> => {
  const body = await readJsonObject(c);
  const name = body.name;
  const email = body.email;
  const password = body.password;

  if (typeof name !== 'string' || name.trim().length === 0) {
    throw new BadRequestError('name is required', 'name');
  }
  if (typeof email !== 'string' || !isEmail(email)) {
    throw new BadRequestError('email is required and must be valid', 'email');
  }
  if (typeof password !== 'string' || !passwordStrongEnough(password)) {
    throw new BadRequestError('password must be at least 8 characters', 'password');
  }

  const db = getDb();
  const existing = db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .get();
  if (existing) {
    throw new ConflictError('Email is already registered', { field: 'email' });
  }

  const passwordHash = await hashPassword(password);
  const inserted = db
    .insert(users)
    .values({ name: name.trim(), email, passwordHash })
    .returning()
    .get();

  setSessionCookie(c, getStore().set(inserted.id));
  return c.json({ data: toUserDto(inserted) }, 201);
});

/** POST /api/auth/login */
authRoutes.post('/login', async (c: Context<AppEnv>): Promise<Response> => {
  const body = await readJsonObject(c);
  const email = body.email;
  const password = body.password;

  if (typeof email !== 'string' || email.trim().length === 0) {
    throw new BadRequestError('email is required', 'email');
  }
  if (typeof password !== 'string' || password.length === 0) {
    throw new BadRequestError('password is required', 'password');
  }

  const row = getDb().select().from(users).where(eq(users.email, email)).get();
  const valid = row !== undefined && (await verifyPassword(row.passwordHash, password));
  if (!valid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Fresh session per login so concurrent devices don't collide.
  setSessionCookie(c, getStore().set(row.id));
  return c.json({ data: toUserDto(row) });
});

/** POST /api/auth/logout */
authRoutes.post('/logout', (c: Context<AppEnv>): Response => {
  const token = getCookie(c, 'session_id');
  if (token) {
    getStore().delete(token);
  }
  deleteCookie(c, 'session_id', { path: '/' });
  return c.body(null, 204);
});

/** GET /api/auth/me */
authRoutes.get('/me', requireAuth(), (c: Context<AppEnv>): Response => {
  const userId = c.get('userId');
  const row = getDb().select().from(users).where(eq(users.id, userId)).get();
  if (!row) {
    throw new UnauthorizedError();
  }
  return c.json({ data: toUserDto(row) });
});

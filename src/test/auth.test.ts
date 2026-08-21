import { describe, before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { createTestApp, closeTestApp, type TestFixture } from './fixtures.js';

type UserDto = {
  id: number;
  name: string;
  email: string;
  phone?: string;
};

describe('auth routes', () => {
  let t: TestFixture;
  const headers = { 'content-type': 'application/json' };
  const alice = { name: 'Alice', email: 'alice@example.com', password: 'correct-horse-1' };

  before(() => {
    t = createTestApp();
  });
  after(() => {
    closeTestApp();
  });

  test('POST /api/auth/register → 201, returns { data: user }, sets session cookie', async () => {
    const res = await t.app.request('/api/auth/register', {
      method: 'POST',
      headers,
      body: JSON.stringify(alice),
    });
    assert.equal(res.status, 201);

    const setCookie = res.headers.get('set-cookie') ?? '';
    assert.match(setCookie, /session_id=/);
    assert.match(setCookie, /HttpOnly/i);

    const body = (await res.json()) as { data: UserDto };
    assert.equal(body.data.name, 'Alice');
    assert.equal(body.data.email, 'alice@example.com');
    assert.ok(typeof body.data.id === 'number');
    // Password must not leak out.
    assert.ok(!('password_hash' in body.data));
    assert.ok(!('password' in body.data));
  });

  test('POST /api/auth/register with duplicate email → 409', async () => {
    const res = await t.app.request('/api/auth/register', {
      method: 'POST',
      headers,
      body: JSON.stringify(alice),
    });
    assert.equal(res.status, 409);
    const body = (await res.json()) as { error: string; details?: { field?: string } };
    assert.match(body.error, /already registered/i);
    assert.equal(body.details?.field, 'email');
  });

  test('POST /api/auth/register with weak password → 400 { error, field }', async () => {
    const res = await t.app.request('/api/auth/register', {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: 'Bob', email: 'bob@example.com', password: 'short' }),
    });
    assert.equal(res.status, 400);
    const body = (await res.json()) as { error: string };
    assert.match(body.error, /at least 8/i);
  });

  test('POST /api/auth/login with correct credentials → 200, sets cookie', async () => {
    const res = await t.app.request('/api/auth/login', {
      method: 'POST',
      headers,
      body: JSON.stringify({ email: alice.email, password: alice.password }),
    });
    assert.equal(res.status, 200);
    assert.match(res.headers.get('set-cookie') ?? '', /session_id=/);
    const body = (await res.json()) as { data: UserDto };
    assert.equal(body.data.email, 'alice@example.com');
  });

  test('POST /api/auth/login with wrong password → 401 { error }', async () => {
    const res = await t.app.request('/api/auth/login', {
      method: 'POST',
      headers,
      body: JSON.stringify({ email: alice.email, password: 'wrong-password' }),
    });
    assert.equal(res.status, 401);
    const body = (await res.json()) as { error: string };
    assert.match(body.error, /invalid/i);
  });

  test('GET /api/auth/me with session → 200 { data: user }', async () => {
    const login = await t.app.request('/api/auth/login', {
      method: 'POST',
      headers,
      body: JSON.stringify({ email: alice.email, password: alice.password }),
    });
    const token =
      login.headers.get('set-cookie')?.split(';')[0]?.match(/session_id=([^;]+)/)?.[1] ?? '';
    assert.ok(token, 'expected a session cookie to be set on login');

    const res = await t.app.request('/api/auth/me', {
      headers: { cookie: `session_id=${token}` },
    });
    assert.equal(res.status, 200);
    const body = (await res.json()) as { data: UserDto };
    assert.equal(body.data.email, 'alice@example.com');
  });

  test('POST /api/auth/logout clears the session', async () => {
    const login = await t.app.request('/api/auth/login', {
      method: 'POST',
      headers,
      body: JSON.stringify({ email: alice.email, password: alice.password }),
    });
    const token =
      login.headers.get('set-cookie')?.split(';')[0]?.match(/session_id=([^;]+)/)?.[1] ?? '';

    const logout = await t.app.request('/api/auth/logout', {
      method: 'POST',
      headers: { cookie: `session_id=${token}` },
    });
    assert.equal(logout.status, 204);
    assert.match(logout.headers.get('set-cookie') ?? '', /session_id=;/);

    const me = await t.app.request('/api/auth/me', {
      headers: { cookie: `session_id=${token}` },
    });
    assert.equal(me.status, 401);
  });
});

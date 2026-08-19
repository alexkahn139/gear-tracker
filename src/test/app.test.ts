import { describe, before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { createTestApp, closeTestApp, type TestFixture } from './fixtures.js';
import { ConflictError } from '../lib/errors.js';

describe('app skeleton', () => {
  let t: TestFixture;

  before(() => {
    t = createTestApp();
    // Register probe routes BEFORE any request is made. Hono's SmartRouter
    // finalizes after the first request, so we can't add routes lazily.
    t.app.get('/__probe_conflict', () => {
      throw new ConflictError('Item is already on loan', { itemId: 7 });
    });
    t.app.get('/__probe_boom', () => {
      throw new Error('kaboom');
    });
  });
  after(() => {
    closeTestApp();
  });

  test('GET /api/health → 200 { data: { status: "ok" } }', async () => {
    const res = await t.app.request('/api/health');
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { data: { status: 'ok' } });
  });

  test('GET /api/auth/me without session → 401 { error: "Unauthorized" }', async () => {
    const res = await t.app.request('/api/auth/me');
    assert.equal(res.status, 401);
    assert.deepEqual(await res.json(), { error: 'Unauthorized' });
  });

  test('unknown route → 404 { error: "Not found" }', async () => {
    const res = await t.app.request('/api/nope');
    assert.equal(res.status, 404);
    assert.deepEqual(await res.json(), { error: 'Not found' });
  });

  test('error middleware shapes ConflictError → 409 with details', async () => {
    const res = await t.app.request('/__probe_conflict');
    assert.equal(res.status, 409);
    assert.deepEqual(await res.json(), {
      error: 'Item is already on loan',
      details: { itemId: 7 },
    });
  });

  test('error middleware shapes unknown throws → 500', async () => {
    const res = await t.app.request('/__probe_boom');
    assert.equal(res.status, 500);
    assert.deepEqual(await res.json(), { error: 'kaboom' });
  });
});

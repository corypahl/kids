import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import worker from './index.js';

const base = 'https://kids.corypahl.dev/christmas/api/parent/verify';
const env = {
  DB: { prepare() { throw Error('Verifying a parent key must not read child data'); } },
  ASSETS: { async fetch() { return new Response('static'); } },
  CHRISTMAS_PARENT_KEY: 'test-parent-secret',
  CHRISTMAS_FAMILY_KEY: 'child-device-secret'
};
const check = headers => worker.fetch(new Request(base, { headers }), env);

describe('tablet profile setup parent authorization', () => {
  it('denies untrusted devices and a family-only token', async () => {
    assert.equal((await check({})).status, 403);
    assert.equal((await check({ 'X-Parent-Key': 'wrong' })).status, 403);
    assert.equal((await check({ 'X-Family-Key': 'child-device-secret' })).status, 403);
  });
  it('accepts the separate parent key and returns no family data', async () => {
    const response = await check({ 'X-Parent-Key': 'test-parent-secret' });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true });
    assert.equal(response.headers.get('cache-control'), 'no-store');
  });
  it('does not authorize with a missing configured parent key', async () => {
    const response = await worker.fetch(new Request(base, {
      headers: { 'X-Parent-Key': 'test-parent-secret' }
    }), { ...env, CHRISTMAS_PARENT_KEY: '' });
    assert.equal(response.status, 403);
  });
});

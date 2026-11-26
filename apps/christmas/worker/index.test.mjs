import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import worker, { assetRequest } from './index.js';

const base = 'https://kids.corypahl.dev';
const make = (path, options) => new Request(base + path, options);
const assets = { fetch: async () => new Response('Christmas app') };

describe('Christmas Worker', () => {
  it('redirects /christmas and strips its prefix exactly once', () => {
    assert.equal(assetRequest(make('/christmas')).redirect, base + '/christmas/');
    assert.equal(assetRequest(make('/christmas/assets/app.js?x=1')).request.url, base + '/assets/app.js?x=1');
    assert.equal(assetRequest(make('/api/status')).request.url, base + '/api/status');
  });
  it('still serves the static app', async () => {
    assert.equal((await worker.fetch(make('/christmas/'), { ASSETS: assets })).status, 200);
  });
  it('never exposes API data with no D1 or family key', async () => {
    assert.equal((await worker.fetch(make('/christmas/api/state?child=emma'), { ASSETS: assets })).status, 503);
  });
  it('requires the family key before any data reads', async () => {
    const env = { ASSETS: assets, DB: {}, CHRISTMAS_FAMILY_KEY: 'secret' };
    assert.equal((await worker.fetch(make('/api/state?child=emma'), env)).status, 401);
    assert.equal((await worker.fetch(make('/api/parent/wishes'), env)).status, 401);
  });
  it('requires a separate parent key for purchase information', async () => {
    const env = { ASSETS: assets, DB: {}, CHRISTMAS_FAMILY_KEY: 'secret', CHRISTMAS_PARENT_KEY: 'other' };
    const res = await worker.fetch(make('/api/parent/wishes', { headers: { 'X-Family-Key': 'secret' } }), env);
    assert.equal(res.status, 403);
  });
  it('checks the family key for audio/photo media', async () => {
    const env = { ASSETS: assets, DB: {}, CHRISTMAS_FAMILY_KEY: 'secret' };
    assert.equal((await worker.fetch(make('/api/media/00000000-0000-0000-0000-000000000000/audio'), env)).status, 401);
  });
  it('rejects future calendar surprises at the server', async () => {
    const env = { ASSETS: assets, DB: {}, CHRISTMAS_FAMILY_KEY: 'secret' };
    const res = await worker.fetch(make('/api/advent', {
      method: 'POST', headers: { 'X-Family-Key': 'secret', 'Content-Type': 'application/json' },
      body: JSON.stringify({ child: 'emma', day: 25 }),
    }), env);
    assert.equal(res.status, 400);
  });
});

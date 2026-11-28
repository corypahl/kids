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
    assert.equal(assetRequest(make('/christmas/parent')).redirect, base + '/christmas/parent/');
    assert.equal(assetRequest(make('/christmas/parent/')).request.url, base + '/parent/');
    assert.equal(assetRequest(make('/parent/')).request.url, base + '/parent/');
  });
  it('serves the parent dashboard at its canonical /parent/ asset URL without redirects', async () => {
    const visited = [];
    const ASSETS = { fetch: async request => {
      const path = new URL(request.url).pathname;
      visited.push(path);
      // Model Workers Assets canonicalization: nested index.html redirects
      // to its directory URL and would break the public gateway.
      if (path === '/parent/index.html') {
        return Response.redirect(base + '/parent/', 307);
      }
      if (path === '/parent/') {
        return new Response('<!doctype html><title>Christmas Parent Dashboard</title>', {
          headers: { 'Content-Type': 'text/html' },
        });
      }
      return new Response('Not Found', { status: 404 });
    } };
    const response = await worker.fetch(make('/parent/'), { ASSETS });
    assert.equal(response.status, 200);
    assert.match(await response.text(), /Christmas Parent Dashboard/);
    assert.deepEqual(visited, ['/parent/']);
  });
  it('still serves the static app', async () => {
    assert.equal((await worker.fetch(make('/christmas/'), { ASSETS: assets })).status, 200);
  });
  it('never exposes API data with no D1 or family key', async () => {
    assert.equal((await worker.fetch(make('/christmas/api/state?child=emma'), { ASSETS: assets })).status, 503);
  });
  it('denies dashboard reads without a verified Google Access assertion', async () => {
    const DB = { prepare() { throw Error('Unauthenticated dashboard requests cannot read private data'); } };
    const env = {
      ASSETS: assets, DB, CHRISTMAS_PARENT_KEY:'parent-secret', CHRISTMAS_FAMILY_KEY:'device-key',
    };
    for (const path of [
      '/api/parent/session','/api/parent/wishes','/api/parent/diary?year=2026',
      '/api/parent/media/00000000-0000-0000-0000-000000000000/photo'
    ]) {
      const res=await worker.fetch(make(path,{headers:{'X-Parent-Key':'parent-secret'}}),env);
      assert.equal(res.status,503); // Auth config missing: fail closed
    }
    const html=await worker.fetch(make('/christmas/parent/',{headers:{'X-Parent-Key':'parent-secret'}}),env);
    assert.equal(html.status,503);
    assert.equal((await worker.fetch(make('/api/device/verify',{headers:{'X-Parent-Key':'parent-secret'}}),env)).status,200);
    assert.equal((await worker.fetch(make('/api/state?child=emma',{headers:{'X-Parent-Key':'parent-secret'}}),env)).status,401);
  });
  it('denies the old parent key on dashboard API even when Access settings exist', async () => {
    const env={
      ASSETS:assets, DB:{prepare(){throw Error('No anonymous DB access');}},
      CHRISTMAS_PARENT_KEY:'parent-secret',
      CHRISTMAS_PARENT_ACCESS_TEAM_DOMAIN:'parents.cloudflareaccess.com',
      CHRISTMAS_PARENT_ACCESS_AUD:'expected-aud',
      CHRISTMAS_PARENT_ALLOWED_EMAILS:'person@example.com',
    };
    const res=await worker.fetch(make('/api/parent/wishes',{headers:{'X-Parent-Key':'parent-secret'}}),env);
    assert.equal(res.status,401);
    assert.equal((await worker.fetch(make('/christmas/parent/'),env)).status,401);
  });
  it('requires the family key before any data reads', async () => {
    const env = { ASSETS: assets, DB: {}, CHRISTMAS_FAMILY_KEY: 'secret' };
    assert.equal((await worker.fetch(make('/api/state?child=emma'), env)).status, 401);
    assert.equal((await worker.fetch(make('/api/parent/wishes'), env)).status, 503);
  });
  it('does not allow a family key to read parent purchases', async () => {
    const env = { ASSETS: assets, DB: {}, CHRISTMAS_FAMILY_KEY: 'secret', CHRISTMAS_PARENT_KEY: 'other',
      CHRISTMAS_PARENT_ACCESS_TEAM_DOMAIN:'parents.cloudflareaccess.com',
      CHRISTMAS_PARENT_ACCESS_AUD:'expected-aud', CHRISTMAS_PARENT_ALLOWED_EMAILS:'person@example.com' };
    const res = await worker.fetch(make('/api/parent/wishes', { headers: { 'X-Family-Key': 'secret' } }), env);
    assert.equal(res.status, 401);
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

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
  it('allows parent routes with a parent key alone but never child endpoints', async () => {
    const DB = { prepare(sql) { return {
      bind() { return this; },
      async all() { return { results: sql.includes('glitter_diary') ? [
        { id: 'a', child: 'emma', day: '2026-12-01', note: 'Glitter in the tree', photo_key: 'image.jpg', audio_key: 'voice.webm' }
      ] : [{ id: 'b', child: 'emma', name: 'Toy', favorite: 1, purchased: 0 }] }; },
      async first() { return { photo_key: 'image.jpg', audio_key: 'voice.webm', photo_type: 'image/jpeg', audio_type: 'audio/webm' }; },
    }; } };
    const env = { ASSETS: assets, DB, CHRISTMAS_PARENT_KEY: 'parent-secret' };
    const headers = { 'X-Parent-Key': 'parent-secret' };
    const wishes = await worker.fetch(make('/api/parent/wishes', { headers }), env);
    assert.equal(wishes.status, 200);
    assert.equal((await wishes.json()).wishes[0].purchased, false);
    const diary = await worker.fetch(make('/api/parent/diary?year=2026', { headers }), env);
    assert.equal(diary.status, 200);
    const entries = (await diary.json()).entries;
    assert.equal(entries[0].hasPhoto, true);
    assert.equal(entries[0].hasAudio, true);
    const MEDIA = { async get() { return { body: new Response('photo').body }; } };
    const media = await worker.fetch(make('/api/parent/media/00000000-0000-0000-0000-000000000000/photo', { headers }), { ...env, MEDIA });
    assert.equal(media.status, 200);
    assert.equal(media.headers.get('cache-control'), 'private, no-store');
    assert.equal((await worker.fetch(make('/api/state?child=emma', { headers }), env)).status, 503);
    assert.equal((await worker.fetch(make('/api/parent/diary?year=2026'), env)).status, 403);
    assert.equal((await worker.fetch(make('/api/parent/media/00000000-0000-0000-0000-000000000000/photo'), env)).status, 403);
  });
  it('requires the family key before any data reads', async () => {
    const env = { ASSETS: assets, DB: {}, CHRISTMAS_FAMILY_KEY: 'secret' };
    assert.equal((await worker.fetch(make('/api/state?child=emma'), env)).status, 401);
    assert.equal((await worker.fetch(make('/api/parent/wishes'), env)).status, 403);
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

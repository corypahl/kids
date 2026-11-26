import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import worker, { assetRequest, verifyAccessToken } from './index.js';

const base = 'https://kids.corypahl.dev';
const make = (path, options) => new Request(base + path, options);
const assets = { fetch: async () => new Response('Christmas app') };
const access = { CHRISTMAS_ACCESS_TEAM_DOMAIN: 'https://test.cloudflareaccess.com', CHRISTMAS_ACCESS_AUD: 'christmas-app-audience' };

describe('Christmas Worker', () => {
  it('redirects /christmas and strips its prefix exactly once', () => {
    assert.equal(assetRequest(make('/christmas')).redirect, base + '/christmas/');
    assert.equal(assetRequest(make('/christmas/assets/app.js?x=1')).request.url, base + '/assets/app.js?x=1');
    assert.equal(assetRequest(make('/api/status')).request.url, base + '/api/status');
  });
  it('still serves the static app', async () => {
    assert.equal((await worker.fetch(make('/christmas/'), { ASSETS: assets })).status, 200);
  });
  it('does not expose data with missing D1 or Access configuration', async () => {
    assert.equal((await worker.fetch(make('/api/state?child=emma'), { ASSETS: assets })).status, 503);
    assert.equal((await worker.fetch(make('/api/state?child=emma'), { ASSETS: assets, DB: {} })).status, 503);
  });
  it('requires signed Access token before viewing any private data or media', async () => {
    const env = { ASSETS: assets, DB: {}, ...access };
    assert.equal((await worker.fetch(make('/api/state?child=emma'), env)).status, 401);
    assert.equal((await worker.fetch(make('/api/parent/wishes'), env)).status, 401);
    assert.equal((await worker.fetch(make('/api/media/00000000-0000-0000-0000-000000000000/audio'), env)).status, 401);
    // A forged Cloudflare identity header cannot stand in for a signed JWT.
    assert.equal((await worker.fetch(make('/api/state?child=emma', { headers: { 'Cf-Access-Authenticated-User-Email': 'parent@example.com' } }), env)).status, 401);
  });
  it('rejects unsigned or attacker-supplied JWTs', async () => {
    assert.equal(await verifyAccessToken('abc.def.ghi', access), false);
    assert.equal(await verifyAccessToken('invalid', access), false);
  });
  it('verifies Cloudflare Access RSA signature, issuer, audience, expiry', async () => {
    const pair = await crypto.subtle.generateKey({
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256'
    }, true, ['sign', 'verify']);
    const key = { ...await crypto.subtle.exportKey('jwk', pair.publicKey), kid: 'test-key' };
    const fetcher = async url => {
      assert.equal(url, 'https://test.cloudflareaccess.com/cdn-cgi/access/certs');
      return new Response(JSON.stringify({ keys: [key] }), { status: 200 });
    };
    const base64url = bytes => Buffer.from(bytes).toString('base64url');
    const sign = async (data) => {
      const head = base64url(JSON.stringify({ alg: 'RS256', kid: 'test-key' }));
      const body = base64url(JSON.stringify(data));
      const input = head + '.' + body;
      const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', pair.privateKey, new TextEncoder().encode(input));
      return input + '.' + base64url(new Uint8Array(sig));
    };
    const good = { iss: access.CHRISTMAS_ACCESS_TEAM_DOMAIN, aud: [access.CHRISTMAS_ACCESS_AUD], exp: Math.floor(Date.now() / 1000) + 3600 };
    assert.equal(await verifyAccessToken(await sign(good), access, fetcher), true);
    assert.equal(await verifyAccessToken(await sign({ ...good, aud: ['other-app'] }), access, fetcher), false);
    assert.equal(await verifyAccessToken(await sign({ ...good, iss: 'https://evil.cloudflareaccess.com' }), access, fetcher), false);
    assert.equal(await verifyAccessToken(await sign({ ...good, exp: 1 }), access, fetcher), false);
    const forged = (await sign(good)).replace(/.$/, 'A');
    assert.equal(await verifyAccessToken(forged, access, fetcher), false);
  });
  it('rejects future calendar surprises without Access authentication', async () => {
    const env = { ASSETS: assets, DB: {}, ...access };
    const res = await worker.fetch(make('/api/advent', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ child: 'emma', day: 25 })
    }), env);
    assert.equal(res.status, 401);
  });
});

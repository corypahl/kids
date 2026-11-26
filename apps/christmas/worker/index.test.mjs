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

  it('fails closed when D1 or Cloudflare Access is not configured', async () => {
    assert.equal((await worker.fetch(make('/api/state?child=emma'), { ASSETS: assets })).status, 503);
    assert.equal((await worker.fetch(make('/api/state?child=emma'), {
      ASSETS: assets, DB: {}, CHRISTMAS_ACCESS_AUD: 'test-audience-12345',
    })).status, 503);
  });

  it('never accepts missing authentication, family keys, or forged Access JWTs', async () => {
    const env = {
      ASSETS: assets, DB: {},
      CHRISTMAS_ACCESS_TEAM_DOMAIN: 'christmas-tests.cloudflareaccess.com',
      CHRISTMAS_ACCESS_AUD: 'christmas-test-audience',
    };
    const rsa = await crypto.subtle.generateKey({
      name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256',
    }, true, ['sign', 'verify']);
    const publicKey = { ...(await crypto.subtle.exportKey('jwk', rsa.publicKey)), kid: 'unit-test-key' };
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => new Response(JSON.stringify({ keys: [publicKey] }), {
      headers: { 'Content-Type': 'application/json' },
    });
    const base64 = data => Buffer.from(data).toString('base64url');
    async function makeJwt(aud = env.CHRISTMAS_ACCESS_AUD, exp = Math.floor(Date.now() / 1000) + 3600) {
      const header = base64(JSON.stringify({ kid: publicKey.kid, alg: 'RS256', typ: 'JWT' }));
      const payload = base64(JSON.stringify({
        iss: 'https://' + env.CHRISTMAS_ACCESS_TEAM_DOMAIN, aud: [aud], exp,
      }));
      const signingInput = header + '.' + payload;
      const bytes = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', rsa.privateKey, new TextEncoder().encode(signingInput));
      return signingInput + '.' + base64(bytes);
    }

    try {
      assert.equal((await worker.fetch(make('/api/status'), env)).status, 401);
      assert.equal((await worker.fetch(make('/api/status', {
        headers: { 'X-Family-Key': 'legacy-secret' },
      }), env)).status, 401);
      const jwt = await makeJwt();
      assert.equal((await worker.fetch(make('/api/status', {
        headers: { 'Cf-Access-Jwt-Assertion': jwt },
      }), env)).status, 200);
      assert.equal((await worker.fetch(make('/api/status', {
        headers: { 'Cookie': 'CF_Authorization=' + jwt },
      }), env)).status, 200);
      assert.equal((await worker.fetch(make('/api/status', {
        headers: { 'Cf-Access-Jwt-Assertion': await makeJwt('other-audience-123456') },
      }), env)).status, 401);
      assert.equal((await worker.fetch(make('/api/status', {
        headers: { 'Cf-Access-Jwt-Assertion': await makeJwt(env.CHRISTMAS_ACCESS_AUD, Math.floor(Date.now() / 1000) - 1) },
      }), env)).status, 401);
      assert.equal((await worker.fetch(make('/api/status', {
        headers: { 'Cf-Access-Jwt-Assertion': jwt.slice(0, -5) + 'AA123' },
      }), env)).status, 401);

      // Parent shopping details require an additional parent key.
      assert.equal((await worker.fetch(make('/api/parent/wishes', {
        headers: { 'Cf-Access-Jwt-Assertion': jwt },
      }), { ...env, CHRISTMAS_PARENT_KEY: 'parent-secret' })).status, 403);
      // Media endpoints require a valid Access session as well.
      assert.equal((await worker.fetch(make('/api/media/00000000-0000-0000-0000-000000000000/audio'), env)).status, 401);
      // The server still rejects surprises before December.
      assert.equal((await worker.fetch(make('/api/advent', {
        method: 'POST',
        headers: { 'Cf-Access-Jwt-Assertion': jwt, 'Content-Type': 'application/json' },
        body: JSON.stringify({ child: 'emma', day: 25 }),
      }), env)).status, 400);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

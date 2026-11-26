import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import worker, { assetRequest } from './index.js';

describe('christmas worker routing', () => {
  it('redirects /christmas to /christmas/', () => {
    const result = assetRequest(new Request('https://kids.corypahl.dev/christmas'));
    assert.equal(result.redirect, 'https://kids.corypahl.dev/christmas/');
  });

  it('strips the Christmas path for downstream assets', () => {
    const result = assetRequest(new Request('https://kids.corypahl.dev/christmas/assets/app.js?rev=1'));
    assert.equal(result.request.url, 'https://kids.corypahl.dev/assets/app.js?rev=1');
  });

  it('preserves direct Worker root requests', () => {
    const result = assetRequest(new Request('https://kids.corypahl.dev/'));
    assert.equal(result.request.url, 'https://kids.corypahl.dev/');
  });

  it('forwards asset requests', async () => {
    let path;
    const env = { ASSETS: { fetch: async (request) => {
      path = new URL(request.url).pathname;
      return new Response('Christmas app');
    } } };
    const response = await worker.fetch(new Request('https://kids.corypahl.dev/christmas/'), env);
    assert.equal(response.status, 200);
    assert.equal(path, '/');
  });
});

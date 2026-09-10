import assert from "node:assert/strict";
import { describe, it } from "node:test";
import worker, { assetRequest } from "./index.js";

describe("bedtime worker routing", () => {
  it("redirects /bedtime to /bedtime/ with 308", () => {
    const result = assetRequest(new Request("https://kids.corypahl.dev/bedtime"));
    assert.equal(result.redirect, "https://kids.corypahl.dev/bedtime/");
  });

  it("strips /bedtime prefix from nested asset requests", () => {
    const result = assetRequest(new Request("https://kids.corypahl.dev/bedtime/assets/index.js"));
    assert.equal(result.request.url, "https://kids.corypahl.dev/assets/index.js");
  });

  it("preserves un-prefixed requests", () => {
    const result = assetRequest(new Request("https://kids.corypahl.dev/"));
    assert.equal(result.request.url, "https://kids.corypahl.dev/");
  });

  it("forwards request to ASSETS binding", async () => {
    let requestedUrl;
    const env = {
      ASSETS: {
        async fetch(request) {
          requestedUrl = request.url;
          return new Response("ok from assets");
        },
      },
    };

    const response = await worker.fetch(
      new Request("https://kids.corypahl.dev/bedtime/"),
      env,
    );

    assert.equal(response.status, 200);
    assert.equal(await response.text(), "ok from assets");
    assert.equal(requestedUrl, "https://kids.corypahl.dev/");
  });

  it("returns 308 redirect when calling worker directly with /bedtime", async () => {
    const response = await worker.fetch(
      new Request("https://kids.corypahl.dev/bedtime"),
      {},
    );
    assert.equal(response.status, 308);
    assert.equal(response.headers.get("location"), "https://kids.corypahl.dev/bedtime/");
  });
});

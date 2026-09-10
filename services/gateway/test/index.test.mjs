import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import worker from "../src/index.js";

const routeCases = [
  ["bedtime", "BEDTIME"],
];

describe("kids gateway", () => {
  it("binds every route to its deployed Worker", () => {
    const configPath = fileURLToPath(new URL("../wrangler.jsonc", import.meta.url));
    const config = JSON.parse(readFileSync(configPath, "utf8"));
    assert.deepEqual(config.services, [
      { binding: "BEDTIME", service: "kids-bedtime" },
    ]);
  });

  it("serves the kids portal hub landing page at /", async () => {
    const response = await worker.fetch(new Request("https://kids.corypahl.dev/"), {});
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "text/html; charset=utf-8");
    const html = await response.text();
    assert.match(html, /Kids Hub/);
    assert.match(html, /Bedtime Routine/);
    assert.match(html, /href="\/bedtime\/"/);
  });

  for (const [prefix, binding] of routeCases) {
    it(`redirects /${prefix} to its trailing-slash URL with 308`, async () => {
      const response = await worker.fetch(
        new Request(`https://kids.corypahl.dev/${prefix}?query=test`),
        {},
      );

      assert.equal(response.status, 308);
      assert.equal(
        response.headers.get("location"),
        `https://kids.corypahl.dev/${prefix}/?query=test`,
      );
    });

    it(`forwards /${prefix}/* through the ${binding} Service Binding stripping the prefix`, async () => {
      let forwardedRequest;
      const env = {
        [binding]: {
          async fetch(request) {
            forwardedRequest = request;
            return new Response(`ok from ${binding}`);
          },
        },
      };

      const response = await worker.fetch(
        new Request(
          `https://kids.corypahl.dev/${prefix}/assets/index.js?v=123`,
          {
            method: "GET",
            headers: { "x-custom-header": "test-header" },
          },
        ),
        env,
      );

      assert.equal(response.status, 200);
      assert.equal(await response.text(), `ok from ${binding}`);
      assert.equal(
        forwardedRequest.url,
        "https://kids.corypahl.dev/assets/index.js?v=123",
      );
      assert.equal(forwardedRequest.headers.get("x-custom-header"), "test-header");
    });
  }

  it("returns 503 when a matched route has no configured binding", async () => {
    const response = await worker.fetch(
      new Request("https://kids.corypahl.dev/bedtime/"),
      {},
    );

    assert.equal(response.status, 503);
    assert.equal(await response.text(), "Downstream service is not configured");
  });

  it("returns 404 for paths outside the gateway route table", async () => {
    const response = await worker.fetch(
      new Request("https://kids.corypahl.dev/unknown-route"),
      {},
    );

    assert.equal(response.status, 404);
    assert.equal(await response.text(), "Not Found");
  });
});

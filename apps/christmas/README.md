# Christmas Village

Family Christmas app at kids.corypahl.dev/christmas/ with separate child profiles.

- Home: Christmas countdown and 24 daily surprises including jokes, games, stories, and activities. Doors unlock December 1–24 by the America/Detroit household date. Opened days sync in D1.
- Wish lists: each child's typed or voice-transcribed wishes sync through D1 and can be viewed or removed on different devices. Browser speech recognition may involve a speech service; typing remains supported.
- Glitter's Diary: one entry per child per date between November 1 and December 25 with optional photo, actual voice recording, and note. D1 stores metadata; private R2 stores media.
- Grown-ups: the separate CHRISTMAS_PARENT_KEY still unlocks purchased-gift checkboxes. Purchase flags never appear in the child's API.
- Family data: no family key to type or store on the tablets. The Worker validates Cloudflare Access's signed JWT on every private API request.
- Games: existing memory, counting, and trivia. Activity completion syncs to D1.

## Before deployment

1. Create a D1 database named kids-christmas and R2 bucket kids-christmas-media in your Cloudflare account. From an authenticated CLI:
   npx wrangler d1 create kids-christmas
   npx wrangler r2 bucket create kids-christmas-media
2. Add repository secret KIDS_CHRISTMAS_D1_DATABASE_ID with the real database UUID returned by Cloudflare. The Christmas deployment workflow injects D1/R2 bindings and applies the migration automatically. For local Wrangler development, copy bindings from wrangler.configured.example.jsonc into wrangler.jsonc and replace the placeholder UUID.
3. The GitHub Action runs D1 migrations remotely before deployment. For manual deployment after configuring bindings, run:
   npx wrangler d1 migrations apply kids-christmas --remote --config apps/christmas/wrangler.jsonc
4. In Cloudflare Zero Trust > Access > Applications, create a **self-hosted** application covering `kids.corypahl.dev/christmas/*` (and the bare `/christmas` redirect if required). Add an **Allow** policy for the exact family Google accounts permitted to use Christmas Village. Do not use a Bypass or Everyone policy. This is the browser's one-time/session sign-in; the Christmas app has no extra family-key form.
5. From that Access application, note the **Application Audience (AUD) tag** and your **Cloudflare Access team domain** (for example `myteam.cloudflareaccess.com`, not the workers.dev subdomain). Add two GitHub repository secrets:
   - `KIDS_CHRISTMAS_ACCESS_TEAM_DOMAIN` = your Access team domain (hostname only)
   - `KIDS_CHRISTMAS_ACCESS_AUD` = your Access application's AUD tag.
   The Christmas workflow injects these as Worker environment variables and fails deployment if either is absent. The Worker also cryptographically verifies the JWT signature and issuer to block unprotected workers.dev bypasses.
6. Keep only the **separate parent gift-tracker key** in the Worker secret `CHRISTMAS_PARENT_KEY`, if you want the private purchase checklist:
   npx wrangler secret put CHRISTMAS_PARENT_KEY --name kids-christmas
   You may delete the obsolete `CHRISTMAS_FAMILY_KEY` secret; the new Worker no longer reads it.
7. Merge/deploy after Access is configured, or run the `build-christmas` GitHub Action. The CI job applies D1 migrations before deploying the Christmas and gateway Workers.

Until D1 and Access settings are configured, the private API returns 503 and does not expose children's wish lists, images, or recordings. If Access is configured but a visitor is not authenticated, the API returns 401. Cloudflare Access must be active for the public gateway path; enabling Access only on the downstream `kids-christmas` Worker does **not** protect service-binding requests.

## Privacy and limits

All private endpoints require a *valid, signature-verified* Cloudflare Access JWT issued for this application. The gateway forwards its Access assertion to the downstream Worker, which verifies its issuer, audience, expiration, and signature against Cloudflare's published public keys. Direct workers.dev calls without an eligible Access session are rejected. Photo and voice files remain in private R2 and are served through authenticated media requests, not public bucket URLs. Parent purchase flags require the separate parent key. Each child is selected in the UI; Cloudflare Access identity does not distinguish which of the three children is using the app. Keep the Access policy allowlist narrow, add rate limits and a data deletion/retention policy before wider use. Browser MediaRecorder requires HTTPS and microphone permission. Photo limit 8 MB; audio limit 6 MB. Test device-specific formats. Strip photo metadata if location privacy is a concern.

Existing browser-local data under christmas-village-v1 is untouched, but is not automatically imported into the new D1 lists. Back it up before clearing the old browser profile.

## Development

From the repo root: npm ci; npm run lint --workspace kids-christmas; npm test --workspace kids-christmas; npm run build --workspace kids-christmas.

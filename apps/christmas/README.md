# Christmas Village

Family Christmas app at kids.corypahl.dev/christmas/ with separate child profiles.

- Home: Christmas countdown and 24 daily surprises including jokes, games, stories, and activities. Doors unlock December 1–24 by the America/Detroit household date. Opened days sync in D1.
- Wish lists: each child's typed or voice-transcribed wishes sync through D1 and can be viewed or removed on different devices. Browser speech recognition may involve a speech service; typing remains supported.
- Glitter's Diary: one entry per child per date between November 1 and December 25 with optional photo, actual voice recording, and note. D1 stores metadata; private R2 stores media.
- Grown-ups: a separate secret unlocks purchased-gift checkboxes. Purchase flags are never returned to the child API.
- Games: existing memory, counting, and trivia. Activity completion syncs to D1.

## Before deployment

1. Create a D1 database named kids-christmas and R2 bucket kids-christmas-media in your Cloudflare account. From an authenticated CLI:
   npx wrangler d1 create kids-christmas
   npx wrangler r2 bucket create kids-christmas-media
2. Add repository secret KIDS_CHRISTMAS_D1_DATABASE_ID with the real database UUID returned by Cloudflare. The Christmas deployment workflow injects D1/R2 bindings and applies the migration automatically. For local Wrangler development, copy bindings from wrangler.configured.example.jsonc into wrangler.jsonc and replace the placeholder UUID.
3. The GitHub Action runs D1 migrations remotely before deployment. For manual deployment after configuring bindings, run:
   npx wrangler d1 migrations apply kids-christmas --remote --config apps/christmas/wrangler.jsonc
4. In Cloudflare Zero Trust, create or identify the **Self-hosted Access application** protecting `kids.corypahl.dev/christmas/*` (including its API). Allow the family's Google identities that should use the app. The kids must be able to use the app via this Access policy. Do not use an unauthenticated Bypass policy.
5. Add two **GitHub repository variables** under Settings → Secrets and variables → Actions → Variables:
   - `KIDS_CHRISTMAS_ACCESS_TEAM_DOMAIN` = `https://<your-team>.cloudflareaccess.com` (your Access issuer URL, without trailing slash)
   - `KIDS_CHRISTMAS_ACCESS_AUD` = the **AUD tag** shown on that Access application (not your account ID). These are configuration values, not secrets.
6. Keep only the `CHRISTMAS_PARENT_KEY` Worker secret for private gift purchase tracking. Once the new deployment works, you may delete the unused `CHRISTMAS_FAMILY_KEY` secret. Do not commit either secret to Git.
7. Merge and deploy the Access-authenticated version. The GitHub workflow injects Access issuer and audience configuration, runs migrations, and deploys the Worker and gateway. It will stop before deployment if the Access variables are absent, to avoid exposing private data. The worker's direct `workers.dev` route and preview URLs are disabled by this deployment.

After the family's normal Cloudflare Access sign-in, Christmas Village loads automatically without any **family key** input. No migration of D1/R2 data is needed.

## Privacy and limits

Every private API call and R2 media request verifies the **signed Cloudflare Access JWT** with the team's published JWKS, correct issuer, audience and expiry. A spoofed Access email header is insufficient; direct Worker requests cannot bypass this check. Photo and voice files stay in private R2. The separate parent key still gates purchased-gift flags. Cloudflare Access policy controls which Google identities can access the family content; make sure it is restricted to the household. Use rate limiting and a data retention policy, and test device-specific microphone formats. Photo limit 8 MB; audio limit 6 MB. Strip photo metadata if location privacy is a concern.

Existing browser-local data under christmas-village-v1 is untouched, but is not automatically imported into the new D1 lists. Back it up before clearing the old browser profile.

## Development

From the repo root: npm ci; npm run lint --workspace kids-christmas; npm test --workspace kids-christmas; npm run build --workspace kids-christmas.

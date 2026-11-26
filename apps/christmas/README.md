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
2. Copy the D1 and R2 bindings from wrangler.configured.example.jsonc into wrangler.jsonc. Replace the placeholder D1 ID with the actual UUID returned by Cloudflare. Keep the binding names DB and MEDIA. The configured example is documentation only, not used automatically by CI.
3. Apply migrations after setting the binding:
   npx wrangler d1 migrations apply kids-christmas --remote --config apps/christmas/wrangler.jsonc
4. Set two different, long, random secrets on the kids-christmas Worker: CHRISTMAS_FAMILY_KEY (used once on each tablet/phone) and CHRISTMAS_PARENT_KEY (for purchases). Never commit them. Wrangler example:
   npx wrangler secret put CHRISTMAS_FAMILY_KEY --name kids-christmas
   npx wrangler secret put CHRISTMAS_PARENT_KEY --name kids-christmas
5. Deploy kids-christmas then kids-gateway, or rerun the existing build-christmas GitHub Action when the account permits it. Initial Worker creation previously failed due to Cloudflare token permissions (see issue #3).

Until bindings and secrets are configured, the private API returns 503 rather than silently storing wishes on one tablet.

## Privacy and limits

All private endpoints require the family key. Photo and voice files remain in private R2 and are served through authenticated media requests, not public bucket URLs. Parent gift flags are available only with the separate parent key. The shared family key identifies a device, not the specific child. Use strong secrets, Cloudflare Access/rate limits, and a data deletion/retention policy before wider use. Browser MediaRecorder requires HTTPS and microphone permission. Photo limit 8 MB; audio limit 6 MB. Test device-specific formats. Strip photo metadata if location privacy is a concern.

Existing browser-local data under christmas-village-v1 is untouched, but is not automatically imported into the new D1 lists. Back it up before clearing the old browser profile.

## Development

From the repo root: npm ci; npm run lint --workspace kids-christmas; npm test --workspace kids-christmas; npm run build --workspace kids-christmas.

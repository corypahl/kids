# Christmas Village

Family Christmas app at kids.corypahl.dev/christmas/ with separate child profiles.

- Landscape tablets: use the full-viewport panoramic scene regardless of CSS width, including an approximately 890×530 CSS-pixel Galaxy Tab A9 viewport. Buildings retain minimum 51–57px touch targets, the top heads-up display is compact, and the far-right post office stays fully on screen. Dress-up creators remain in side-by-side preview/customization panels; the Advent overlay uses a compact 8-column grid. Portrait phones retain the tall vertical village. The new Fidget Maker adds an optional native accelerometer bridge in the Android app, so the native shake enhancement needs a new AAB/Play update; all touch and browser motion features are web-first.
- Android shake: no sensor permission is required for the accelerometer. The native bridge registers a listener **only** when a user enables motion inside the Fidget Maker, pauses while the app is backgrounded and unregisters on exit. The browser uses standard device-motion events when available, and the touch Shake button always works. No motion readings are stored or uploaded. The GitHub Android workflow builds a signed AAB on main for Android changes, but publishing to Play Internal Testing is a separate manual action.
- Device profiles: a parent assigns each tablet once in Settings, saved to localStorage per device. The daily interface shows only that child's profile; to change it, a parent re-enters the existing Christmas parent-dashboard key. The key is verified by the Worker and is not saved on the tablet. Clearing the tablet's app/browser storage requires setting it up again. This prevents casual switching in the UI, not access by someone with the separate shared family API credential.
- Home: immersive, original village scene with eight tappable stops. Santa's Workshop still plays the provided YouTube livestream; Santa's Mailbox keeps individual wish lists; **Reindeer Games** is the hub for memory, counting, and trivia (with room for future games); **Elf Design School** offers cookie, snowman, elf, and gingerbread customization; **Mrs. Claus's Cabin** combines Adventures & Crafts (24 existing activities) and Kindness Corner (kindness category of those activities); Glitter's Cottage and the Advent Tree are unchanged. The Reindeer Barn feeding activity and its village destination have been removed. **Naughty or Nice?** opens a separate self-rating slider.
- Wish lists: each child's typed or voice-transcribed wishes sync through D1 and can be viewed or removed on different devices. Browser speech recognition may involve a speech service; typing remains supported.
- Glitter's Diary: one entry per child per date between November 1 and December 25 with optional photo, actual voice recording, and note. D1 stores metadata; private R2 stores media.
- Grown-ups: standalone web dashboard at https://kids.corypahl.dev/christmas/parent/ for all three kids' wish lists, purchases, and Glitter diary photos/voice recordings. It requires only the separate parent secret, in memory for the current page session. No adult controls appear in the children's Android app.
- Games: Reindeer Games is the single hub for interactive arcade games, currently memory/picture match, counting, and trivia. Elf Design School holds the original elf/snowman creators, cookie decorating and gingerbread dress-up; saved character collections remain stored per child on the tablet and are unaffected.
- Activity organization: Mrs. Claus's Cabin has Adventures & Crafts plus Kindness Corner; completed checkboxes use the existing D1 progress table. The Naughty or Nice check-in uses new `0002_naughty_nice_answers.sql` D1 migration and `GET/POST /api/nice-meter` endpoints. One 0–100 self-reported slider value per child/year is saved and can be updated; the route requires the existing family key, and the server validates child, current year, and bounds.
- Original scene art and decorations are vector/CSS illustrations, not Google's Santa Tracker assets. No external game assets or new backend migrations are required.
- Android: the existing WebView shell immediately receives the refreshed web interface after the Cloudflare deployment. No Google Play configuration or APK release is needed for these changes.

## Before deployment

1. Create a D1 database named kids-christmas and R2 bucket kids-christmas-media in your Cloudflare account. From an authenticated CLI:
   npx wrangler d1 create kids-christmas
   npx wrangler r2 bucket create kids-christmas-media
2. Add repository secret KIDS_CHRISTMAS_D1_DATABASE_ID with the real database UUID returned by Cloudflare. The Christmas deployment workflow injects D1/R2 bindings and applies the migration automatically. For local Wrangler development, copy bindings from wrangler.configured.example.jsonc into wrangler.jsonc and replace the placeholder UUID.
3. The GitHub Action runs D1 migrations remotely before deployment. For manual deployment after configuring bindings, run:
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

- YouTube child-directed embedding: uses youtube-nocookie.com only after the child presses Play, with a normal HTTP Referer policy. The video owner must permit embedding and keep the stream active; a direct watch link is provided for errors. YouTube requires app/site owners to self-designate child-directed embeds: https://support.google.com/youtube/answer/171780. Review Play Console audience, content ratings, and Data Safety disclosures before publishing. Videos and their content are third-party and not controlled by this app.

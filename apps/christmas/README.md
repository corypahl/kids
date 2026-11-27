# Christmas Village

Family Christmas app at kids.corypahl.dev/christmas/ with separate child profiles.

- Landscape tablets: use the full-viewport panoramic scene regardless of CSS width, including an approximately 890×530 CSS-pixel Galaxy Tab A9 viewport. Buildings retain minimum 51–57px touch targets, the top heads-up display is compact, and the far-right post office stays fully on screen. Dress-up creators remain in side-by-side preview/customization panels; the Advent overlay uses a compact 8-column grid. Portrait phones retain the tall vertical village. There are no Android/Play Console changes.
- Device profiles: a parent assigns each tablet once in Settings, saved to localStorage per device. The daily interface shows only that child's profile; to change it, a parent re-enters the existing Christmas parent-dashboard key. The key is verified by the Worker and is not saved on the tablet. Clearing the tablet's app/browser storage requires setting it up again. This prevents casual switching in the UI, not access by someone with the separate shared family API credential.
- Home: original full-screen village artwork, landscape-tablet and portrait-phone layouts, tappable buildings and parent-key-protected Settings. **Santa's Workshop** opens the provided YouTube livestream in an embedded player (with a direct YouTube fallback). **Mrs. Claus’s Design Studio** is the sole entrance for creative editors: cookies, snowmen, elves, and a new gingerbread dress-up creator. **Elf Post Office** contains each child's existing Santa wish list; **Toy Factory** contains only the memory, counting, and trivia games. Craft Cabin provides all 24 activities, including kindness activities. Glitter's diary, Reindeer Barn, and Advent Tree retain their existing behavior. The separate parent dashboard is unchanged.
- Wish lists: each child's typed or voice-transcribed wishes sync through D1 and can be viewed or removed on different devices. Browser speech recognition may involve a speech service; typing remains supported.
- Glitter's Diary: one entry per child per date between November 1 and December 25 with optional photo, actual voice recording, and note. D1 stores metadata; private R2 stores media.
- Grown-ups: standalone web dashboard at https://kids.corypahl.dev/christmas/parent/ for all three kids' wish lists, purchases, and Glitter diary photos/voice recordings. It requires only the separate parent secret, in memory for the current page session. No adult controls appear in the children's Android app.
- Games: Toy Factory's memory, counting, and trivia games remain. Mrs. Claus’s Design Studio reuses the existing elf and snowman dress-up games and their saved localStorage collections; gingerbread adds icing, outfits, faces, candy, randomize, and a separate 10-design-per-child collection on each tablet.
- Studio: original cookie decorator (current session state only), Elf Creator, Snowman Creator, and Gingerbread Designer live under one accessible project switcher. In-progress designs remain intact while switching editors within the studio. Reindeer Barn keeps its snack-feeding activity. Existing D1 Advent, diary, wishes, and activity data are unchanged.
- Original scene art and decorations are vector/CSS illustrations, not Google's Santa Tracker assets. No external game assets or new backend migrations are required.
- Android: the existing WebView shell loads the live web interface after the Cloudflare deployment. YouTube embeds require playback access and network availability; if the creator disables embedding, children can use the direct YouTube link. No Google Play release is required for these site-only updates.

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

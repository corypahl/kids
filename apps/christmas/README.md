# Christmas Village

Family Christmas app at kids.corypahl.dev/christmas/ with separate child profiles.

- Landscape tablets: use the full-viewport panoramic scene regardless of CSS width, including an approximately 890×530 CSS-pixel Galaxy Tab A9 viewport. Buildings retain minimum 51–57px touch targets, the top heads-up display is compact, and the far-right post office stays fully on screen. Dress-up creators remain in side-by-side preview/customization panels; the Advent overlay uses a compact 8-column grid. Portrait phones retain the tall vertical village. There are no Android/Play Console changes.
- Device profiles: a parent assigns each tablet once in Settings, saved to localStorage per device. The daily interface shows only that child's profile; to change it, a parent re-enters the existing Christmas parent-dashboard key. The key is verified by the Worker and is not saved on the tablet. Clearing the tablet's app/browser storage requires setting it up again. This prevents casual switching in the UI, not access by someone with the separate shared family API credential.
- Home: an immersive, full-bleed Christmas world with a separate portrait illustration for phones and landscape illustration for tablets/desktops. Child greeting, countdown and parent-key-protected Settings float inside the world, and the village starts at the top of the screen. On phones, scroll vertically along the snowy path instead of swiping a clipped desktop map. The live artwork is original and reduced-motion preferences are respected. An original illustrated, tappable Christmas Village. Santa's Workshop opens wish lists; Glitter's Cottage opens the diary; Toy Factory opens games; Craft Cabin and Elf Post Office filter the existing activities; the Advent Tree opens the 24 daily surprises in an immersive overlay; Cookie Bakery and Reindeer Barn open new playable activities. The village itself is the main navigation: no duplicate top tab menu or bottom quick-link buttons. Landmark buttons are keyboard accessible, the world scrolls vertically on smaller screens, and every destination offers a Back to the village button. Countdown and Advent openings still sync in D1. The Advent Tree opens a full-screen calendar overlay with a close button instead of sending kids to the bottom of a web page.
- Wish lists: each child's typed or voice-transcribed wishes sync through D1 and can be viewed or removed on different devices. Browser speech recognition may involve a speech service; typing remains supported.
- Glitter's Diary: one entry per child per date between November 1 and December 25 with optional photo, actual voice recording, and note. D1 stores metadata; private R2 stores media.
- Grown-ups: standalone web dashboard at https://kids.corypahl.dev/christmas/parent/ for all three kids' wish lists, purchases, and Glitter diary photos/voice recordings. It requires only the separate parent secret, in memory for the current page session. No adult controls appear in the children's Android app.
- Games: existing memory, counting, and trivia, plus the new **Elf Creator** and **Snowman Creator**. Dress-up controls let kids customize faces, hair, hats, outfits, accessories, and scenes. Characters can dance, randomize looks, and save up to 10 designs per child and creator on the current device (localStorage only; not yet synced through D1).
- New activities: Cookie Bakery's tap-to-decorate cookie game and Reindeer Barn's snack-feeding game with fun facts. Two direct village destinations, Elf Design Studio and Snowman Garden, open their corresponding creators in the Toy Factory. These creative mini-games reset on leaving the page; existing D1 progress and diary/wish data remain unchanged.
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

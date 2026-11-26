# Christmas Village — Android / Google Play Internal Testing

The Android app is a tablet-friendly WebView shell for `https://kids.corypahl.dev/christmas/`, following the existing Audible Android app design in `corypahl/fantasy`.

- Package ID: **`dev.corypahl.christmas`** (new Play Console app; distinct from Audible).
- Microphone: uses Android's speech recognition for the Santa wish-list mic button; diary voice clips use WebView `MediaRecorder` with runtime microphone permission.
- Photos: supports the system camera and gallery picker in Glitter's Diary.
- Server: Cloudflare Workers, D1 and R2 remain the source of truth. Internet is required.
- Family key: **no family-key screen inside the Android app**. The signed internal-testing build contains the worker family key and automatically sends it with API requests. The web app retains its existing optional key screen for debugging; child profiles are still selected manually.
- Parent purchase tracking: continues to require the separate `CHRISTMAS_PARENT_KEY`; never bundle this parent key.

## Google Play setup

1. In Play Console, create a new app **Christmas Village** with package ID `dev.corypahl.christmas`. Complete initial Play App Signing and Internal testing setup, including tester email addresses. The account on each tablet must be enrolled as a tester.
2. In the **kids repo's** Actions secrets, provide the same signing credentials and Play service account JSON used for your Audible Android project (secrets do not automatically flow across GitHub repositories unless configured as organization secrets):
   - `ANDROID_KEYSTORE_BASE64`
   - `ANDROID_KEYSTORE_PASSWORD`
   - `ANDROID_KEY_ALIAS`
   - `ANDROID_KEY_PASSWORD`
   - `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`
3. Add one new Actions secret `ANDROID_CHRISTMAS_FAMILY_KEY` containing the **same value** as the Cloudflare Worker secret `CHRISTMAS_FAMILY_KEY`. If you lost the original, rotate both the Worker secret and this GitHub secret together. Never commit the value.
4. Trigger **Build/Publish: Christmas Village Android** on `main` using **Run workflow** and set `publish_to_play: true`. The workflow verifies signing and uploads the AAB to the Internal track. Subsequent Android releases can use the same workflow. The initial Play app sometimes requires a first manual bundle/upload before API publishing is enabled.
5. When a Play Internal testing release is available, enroll testers and install it from Play. Verify Emma/Sophie/Adam lists sync to D1 and photos and microphone recordings save and replay.

Pull requests and pushes to `main` build a debug APK without the family credential. The debug APK is for compilation and UI inspection; it **cannot save shared data** until the Android build is configured with a matching family key. Only explicit manual workflow runs with `publish_to_play: true` embed credentials and publish, to avoid accidentally distributing secrets in public CI artifacts.

## Important security limitation

**Distributing the UI through an APK does not make the Cloudflare API private.** The Worker API remains internet-reachable, and a key stored in an APK can be extracted by someone with access to the package. This approach removes the children's setup step but should not be considered strong authentication for their photos and voice recordings.

For lasting privacy, replace the shared APK key with cryptographically verified account tokens or Play Integrity-bound server sessions before broad distribution. Do not merge the alternative Cloudflare Access browser-login PR #6 into this Android approach; Google browser sign-in is not compatible with every embedded WebView, and it would change the auth flow.

## Build locally

Use Java 17, Android SDK 36 and Gradle 8.13 or the GitHub workflow:

```bash
gradle -p apps/christmas/android :app:testDebugUnitTest :app:assembleDebug
```

To build a signed release, supply `ANDROID_CHRISTMAS_FAMILY_KEY` and `ANDROID_RELEASE_*` signing environment variables as defined in `app/build.gradle.kts`. Never paste these into source or store them in the repository.

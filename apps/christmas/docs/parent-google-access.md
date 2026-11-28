# Christmas Parent Dashboard — Google sign-in through Cloudflare Access

Production dashboard: https://kids.corypahl.dev/christmas/parent/

## Status and prerequisites

Do **not** merge the Google sign-in PR before the Cloudflare Access application
and GitHub Actions repository variables below are configured. Deploying without
them intentionally blocks the parent dashboard and its APIs (HTTP 503), rather
than falling back to the old shared parent key.

Reuse the already-configured Google identity provider from your Tracker app.
The Christmas kids' pages stay public; *only* the parent dashboard and parent
API require Google sign-in. Tablet profile Settings remains separately guarded
by its existing parent key at `/christmas/api/device/verify`.

## 1. Create exactly one path-scoped Cloudflare Access application

Cloudflare Zero Trust → Access controls → Applications → Create application →
Self-hosted and private (public hostname).

**Name:** Christmas Parent Dashboard

**Public hostnames / paths**, both on the *same* Access application (and thus
with the *same* Application Audience/AUD tag):

1. `kids.corypahl.dev/christmas/parent*` (includes the trailing-slash dashboard).
2. `kids.corypahl.dev/christmas/api/parent/*` (wishes, purchase statuses,
   diary, media and the session endpoint).

Use the Google identity provider **only** and select instant authentication if
available. Attach an **Allow** policy with the **Emails** selector naming only
the two approved parent accounts. Never use an email-domain-wide allow,
Everyone, a bypass rule, or a service-token rule for these paths.

**Do not protect** `/christmas/`, `/christmas/api/state`,
`/christmas/api/device/verify`, or the other child-game API paths.
The installed Android tablets must continue working without Google's login.

The dashboard assets are in `/christmas/assets/` and contain no parent data;
all parent HTML/data/diary media requests are verified inside the Worker.
The Cloudflare Access application must cover the parent UI and API paths.
For additional hardening, check there are no other accessible public hostnames
or broad Access bypass applications on this domain.

## 2. Copy the Access audience tag and your team domain

Under the application's Additional settings, copy the **Application
Audience (AUD) Tag**. In Cloudflare Access, identify your Zero Trust team
hostname (`<team>.cloudflareaccess.com`). Use the hostname alone, without
`https://` or a path.

In GitHub `corypahl/kids` → Settings → Secrets and variables → Actions →
**Variables**, add:

| Variable name | Value |
| --- | --- |
| `KIDS_PARENT_ACCESS_TEAM_DOMAIN` | `<team>.cloudflareaccess.com` |
| `KIDS_PARENT_ACCESS_AUD` | Exact Access application's AUD tag |
| `KIDS_PARENT_ALLOWED_EMAILS` | The two approved Google emails, comma-separated |

The Christmas deployment workflow copies these non-secret values into the
Worker environment as `CHRISTMAS_PARENT_ACCESS_TEAM_DOMAIN`,
`CHRISTMAS_PARENT_ACCESS_AUD` and `CHRISTMAS_PARENT_ALLOWED_EMAILS`.
The token is verified against the current Cloudflare Access JWKS with RS256
signature, exact issuer, audience, type `app`, expiry and email allowlist.
An asserted email header or the old shared parent key cannot authorize the
dashboard or its private API.

If the existing repository already uses Cloudflare Access secrets/variables,
reuse the same *Google IdP*, but use this new Access application's exact AUD.

## 3. Merge and deploy the PR

After configuring Access and the three repository variables, merge the
Google parent sign-in PR. The existing `build-christmas` CI tests and deploys
the Worker and gateway. The setup step explicitly refuses deployment if
the required Access environment variables are missing.

The `kids-christmas` Worker disables its `workers.dev` and preview URLs.
The public app continues through the `kids-gateway` service binding.

The existing `CHRISTMAS_PARENT_KEY` Worker secret stays for **tablet Settings
only**. It is no longer accepted for parent dashboard purchases, diary or
other private parent API calls.

## 4. Verify from separate browser sessions

1. In an incognito window, visit `/christmas/parent/`. It must redirect to
   Cloudflare Access / Google instead of displaying the dashboard.
2. Sign in with each allowed Google account. Each must see the dashboard,
   its own verified email in the header, all three wish lists and diary media.
3. Sign out using **Sign out** (Cloudflare Access logout).
4. Sign in with a different Google account. It must be denied.
5. Test `/christmas/api/parent/wishes` anonymously and with the old
   `X-Parent-Key`: neither should return private data.
6. On a child's tablet, check the usual Christmas app, Wish List, and
   Settings profile unlock (the separate key). These do not require Google.
7. Check direct `workers.dev` and preview URLs are disabled and no other
   hostname routes to the Christmas Worker without validated assertions.

Cloudflare Access identity is not propagated through Worker service bindings;
the Christmas Worker therefore verifies the signed
`Cf-Access-Jwt-Assertion` itself, even though Cloudflare also gates the public
paths. The HTML and private API both fail closed without a valid token.

Reference: https://developers.cloudflare.com/workers/configuration/cloudflare-access/
Reference: https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/

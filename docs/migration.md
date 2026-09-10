# Monorepo Migration

## Imported revisions

The source repositories were imported without squashing using `git subtree add` so their histories remain available through the monorepo merge commits.

| Source repository | Imported revision | Target |
| --- | --- | --- |
| `kids-bedtime` | `64e989df2bf15784a95f4a6789a7dcc23d9c7332` | `apps/bedtime` |

## Cloudflare deployment cutover

1. **GitHub Secrets & Variables**:
   - Configure `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in GitHub repository secrets.
2. **Workers**:
   Deploy the downstream Worker first:
   - `kids-bedtime` (from `apps/bedtime`)
3. **Gateway Deployment**:
   Deploy `kids-gateway` (from `services/gateway`). Its `wrangler.jsonc` automatically configures the `BEDTIME` Service Binding.
4. **Custom Domain**:
   In the Cloudflare Dashboard:
   - Go to Worker `kids-gateway` > **Settings** > **Domains & Routes** > **Custom Domains**.
   - Add `kids.corypahl.dev`.
   - Remove `kids.corypahl.dev` from any legacy standalone worker project if previously attached.

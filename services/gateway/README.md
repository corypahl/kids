# Kids Gateway

Cloudflare Worker providing public edge routing for `kids.corypahl.dev`.

## Routing

- `/` serves the Kids Portal Hub landing page.
- `/bedtime/*` strips the `/bedtime` prefix and forwards requests to the `kids-bedtime` Worker using the `BEDTIME` Service Binding.

## Development

```bash
npm run test --workspace kids-gateway
npm run dev --workspace kids-gateway
```

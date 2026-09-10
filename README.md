# Kids

Monorepo for family and kids applications and supporting edge services.

## Repository layout

- `apps/bedtime`: Bedtime Routine Spinner interactive checklist for Emma and Sophie.
- `services/gateway`: Cloudflare Worker routing `kids.corypahl.dev` to downstream applications via Service Bindings.
- `docs/`: Architecture and migration documentation.

Each application is an independently deployable Cloudflare Worker project. The root npm scripts provide commands for working with all projects together.

## Public routing

| Host & Path | Service | Downstream Project | Description |
| --- | --- | --- | --- |
| `kids.corypahl.dev/` | `kids-gateway` | *(Internal)* | Kids portal hub with quick launch cards |
| `kids.corypahl.dev/bedtime/*` | `kids-gateway` | `kids-bedtime` | Bedtime Routine Spinner app |

## Getting started

```bash
npm install
npm run build
npm test
```

See `docs/architecture.md` for architecture details and `docs/migration.md` for imported source revisions and Cloudflare deployment steps.

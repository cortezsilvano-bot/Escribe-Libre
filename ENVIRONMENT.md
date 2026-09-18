# Environment Configuration

## Local development

There is nothing to configure. `npm install && npm run dev` gives you a working
word processor; documents go to IndexedDB and preferences to `localStorage`.

Copy `.env.example` to `.env.local` only if you want to change the app name or
URL, or to enable the optional sync mode.

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_APP_NAME` | `Escribe Libre` | Branding in metadata and the UI |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Absolute URLs for metadata, robots, sitemap |
| `APP_DATA_MODE` | `mock` | `mock` = browser storage, `supabase` = account-backed sync |

## Optional sync mode

Required only when `APP_DATA_MODE=supabase`:

| Variable | Exposure | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | browser | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser | Anon key, constrained by RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Privileged server operations |

In production, `getServerEnv()` throws at startup if `APP_DATA_MODE=supabase`
and any of the three is missing, so a half-configured deployment fails fast
instead of silently falling back to local storage.

Variables prefixed with `NEXT_PUBLIC_` reach the browser. The service-role key
must not be, and is not, part of the public schema. The validator reports
missing variable names, never their values.

## Commands

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm run test
npm run test:e2e
npm run build
```

`npm run verify` runs typecheck, lint, unit tests, e2e tests, and the build.
`npm run release:check` adds the `upgrade/` desktop frontend.

## Runtime checks

- `GET /api/health` - liveness, service name, and current data mode.
- `GET /api/readiness` - which dependencies are configured. In `mock` mode
  everything required is local, so this reports ready with no credentials set.

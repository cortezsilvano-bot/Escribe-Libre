# Deployment

## Local

1. Install Node 24.
2. Run `npm install` and `npm run dev`. No environment file is required.
3. Validate with `npm run verify`.

## What actually needs a server

Almost nothing. The editor runs in the browser and stores documents there, so a
deployment is mostly static delivery plus one route handler:

- `POST /api/import/docx` converts an uploaded Word file with mammoth. It needs
  the Node runtime and is the only route that does real work.
- `GET /api/health` and `GET /api/readiness` are for your monitoring.

`next.config.ts` sets `output: "standalone"`, so `next build` emits a
self-contained server under `.next/standalone` that runs anywhere Node runs.

## Any Node host

```bash
npm ci
npm run build
node .next/standalone/server.js
```

Copy `.next/static` and `public/` alongside the standalone output, as the
Next.js standalone docs describe. Set `NEXT_PUBLIC_APP_URL` to the public
origin so metadata, `robots.txt`, and `sitemap.xml` are correct.

## Vercel

Import the repository, set the build command to `npm run build`, and configure
`NEXT_PUBLIC_APP_NAME` and `NEXT_PUBLIC_APP_URL`. Leave `APP_DATA_MODE=mock`
unless you are enabling sync. No other variables are required.

## Headers and CSP

`next.config.ts` owns the security headers, including a CSP that allows only
the app's own origin plus Supabase for `connect-src`, and `https:` images so
documents can reference remote pictures. If you front the app with a CDN or
proxy that injects its own headers, make sure it does not weaken or duplicate
these.

## Service worker

`public/sw.js` caches the app shell and is registered in production only. It
uses network-first with a cache fallback, so a deploy is picked up on the next
successful load. If you ship a breaking change to the shell, bump `CACHE_NAME`
so old entries are dropped on activate.

## Optional: Supabase sync

Create a clean project and run the migrations in order with `supabase db push`.
Configure Auth redirect URLs. Review every RLS policy with integration tests
before real traffic — the document ACL is the entire authorisation model. Then
set the three Supabase variables and `APP_DATA_MODE=supabase`; the production
env validator fails the boot if any is missing.

Note that the Supabase `DocumentRepository` adapter is not implemented yet, so
this mode currently configures credentials without changing where documents are
stored. See `IMPLEMENTATION_PLAN.md`, Milestone 5.

## Rollback

Promote the previous immutable deployment. Because documents live in each user's
browser, a rollback does not risk their data — but a schema change to
`DocumentRecord` can, since older code may refuse to parse documents written by
newer code. Treat the Zod schemas as a compatibility contract: add optional
fields, and give them defaults, rather than changing or removing existing ones.

If you have enabled Supabase sync, do not roll migrations backward
destructively. Apply a forward repair migration and restore from PITR only after
incident approval.

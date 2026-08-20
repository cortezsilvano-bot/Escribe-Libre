# Deployment

## Local

1. Install Node 24 and pnpm 11.7.
2. Copy `.env.example` to `.env.local`; leave `APP_DATA_MODE=mock`.
3. Run `pnpm install`, `pnpm verify:env`, `pnpm dev`.
4. Validate with `pnpm verify`.

## Supabase

Create a clean project, enable PostGIS and pgvector, then run migrations in order with `supabase db push`. Run `supabase/seed.sql` only in a development project. Configure Auth redirect URLs and require MFA for provider/admin roles. Verify every RLS integration test before production traffic.

## Typesense and jobs

Create `listings_v1` from `src/lib/search/typesense-schema.ts`, install its synonyms, and run a full reindex from PostgreSQL. Configure QStash for the search outbox and alert jobs, with signing-key rotation. PostgreSQL remains authoritative if the index is rebuilt.

## Vercel

Import the repository, select pnpm, set the build command to `pnpm build`, and configure production variables from `.env.example`. Set `APP_DATA_MODE=supabase`; the environment verifier must pass. Attach the verified email domain, Mapbox token restrictions, Sentry source-map secret, and PostHog host.

## Rollback

Promote the previous immutable Vercel deployment. Do not roll database migrations backward destructively. Apply a forward repair migration, pause QStash consumers, and rebuild Typesense from PostgreSQL. Restore Supabase from PITR only after incident approval and preserve audit logs.


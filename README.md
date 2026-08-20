# Rental Marketplace

A production-oriented Houston rental discovery, listing aggregation, and lead-routing modular monolith. The application emphasizes active-record verification, source provenance, freshness, duplicate review, and deterministic total monthly/move-in costs. It is not a broker, screening product, lease negotiator, escrow service, or payment custodian.

Local development needs no paid API keys. All 108 Houston-area listings and property images are synthetic and clearly labeled.

## Quick start

```bash
cp .env.example .env.local
pnpm install
pnpm verify:env
pnpm dev
```

Open `http://localhost:3000`. Primary demos: `/search`, a listing detail, `/saved`, `/compare`, `/provider/listings/new`, and `/admin`.

## Verification

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm exec playwright install chromium
pnpm test:e2e
pnpm build
```

## Architecture

Next.js App Router and strict TypeScript form a modular monolith. Supabase/PostgreSQL is authoritative in production; Typesense is a derived outbox-fed index; Upstash/QStash handles rate limits/jobs; Mapbox, Resend, Sentry, and PostHog are optional credentialed adapters. Mock mode supplies deterministic fixtures, illustrative maps, and local workflow state.

Read `IMPLEMENTATION_PLAN.md`, `ARCHITECTURE.md`, `DATA_MODEL.md`, `SECURITY.md`, `ENVIRONMENT.md`, and the `docs/` runbooks.

## Database and deployment

Apply `supabase/migrations` in order to a clean Supabase project, then optionally load `supabase/seed.sql` in development only. Never seed fixtures into production. Configure Typesense from `src/lib/search/typesense-schema.ts`, set Vercel environment variables, run all CI gates, and switch `APP_DATA_MODE=supabase`. See `docs/DEPLOYMENT.md` for rollback and dependency setup.

## Intentionally excluded

Tenant screening, credit/criminal/eviction checks, applicant scoring, income verification, rent/deposit collection, escrow, lease negotiation/e-signature, landlord reviews, nationwide coverage, native apps, and hidden/protected-class personalization are not implemented. AI, SMS, RentCast, and provider billing remain disabled feature-flagged interfaces.

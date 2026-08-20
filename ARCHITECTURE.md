# Architecture

## Shape

The rental marketplace is a Next.js App Router modular monolith. UI, route handlers, and domain services ship together, while integrations sit behind typed ports. This keeps local development simple and allows Supabase, Typesense, Mapbox, Upstash, QStash, Resend, PostHog, and Sentry to be enabled independently.

```text
Browser / server-rendered pages
        |
Next.js routes and server operations
        |
Domain services (search, cost, trust, ingestion, alerts)
        |
Typed provider ports
        |
Supabase | Typesense | Mapbox | Upstash | email providers
        |
Deterministic fixture/mock adapters in local development
```

## Authority boundaries

- Supabase PostgreSQL is the production system of record.
- Typesense is a disposable derived index populated through an outbox.
- Listing facts come only from provider submissions, licensed adapters, or clearly synthetic development fixtures.
- Verification UI is derived from an active `verification_records` row, never from a provider-supplied boolean.
- Price and cost results come from the deterministic total-cost module, never an LLM.
- Browser role claims are display hints only; production authorization is evaluated server-side and by RLS.

## Application modules

- `src/domain`: types and pure business rules.
- `src/data`: generated Houston fixtures and read models.
- `src/lib/search`: query parsing, URL serialization, ranking, and search adapters.
- `src/lib/total-cost`: fee and concession calculation.
- `src/lib/trust-safety`: verification, freshness, duplicate scoring, address normalization, and content scanning.
- `src/lib/providers`: external adapter contracts and mock implementations.
- `src/components`: accessible application shell and domain components.
- `src/app`: pages and typed route handlers.
- `supabase/migrations`: normalized schema, triggers, indexes, and policies.

## Runtime modes

`APP_DATA_MODE=mock` is the safe local default. It uses generated Houston inventory and browser-local demo workflows. `APP_DATA_MODE=supabase` requires validated server credentials and enables durable records. Search can still fall back to PostgreSQL if Typesense is unavailable; readiness reports the degraded dependency.

External integrations are opt-in flags. RentCast is a licensed API adapter only and never a scraper. AI, SMS, and provider billing are disabled by default and are not required by core flows.

## Search and indexing

Writes commit to PostgreSQL together with a `search_index_outbox` event. A QStash-triggered or manually invoked idempotent worker upserts Typesense records, records attempts, and moves exhausted events to a failed state. Public search applies hard filters first, then geography, text, freshness, active verification, source trust, and completeness. Sponsored inventory occupies explicit labeled slots and never modifies organic rank.

## Deployment

Vercel hosts Next.js; Supabase hosts Postgres/Auth/Storage; Typesense provides the production search index. Upstash Redis supplies distributed caching and rate limits and QStash runs serverless jobs. Resend delivers email. Sentry and PostHog are loaded only when configured and use typed wrappers that exclude message bodies, documents, and tokens.


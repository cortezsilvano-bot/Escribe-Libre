# Rental Marketplace Implementation Plan

## Repository audit

- Existing product: a local-first Next.js 16 / React 19 / TypeScript text editor with an optional Tauri shell.
- Existing package manager: npm (`package-lock.json`), although pnpm 11.7 is available. The marketplace will standardize on pnpm and keep a single application package to avoid a premature monorepo migration.
- Existing quality baseline on 2026-07-15: typecheck, ESLint, 11 Vitest tests, and the Next.js production build pass.
- Existing reusable work: strict TypeScript configuration, Next App Router setup, Vitest/Playwright configuration, Supabase client boundaries, CI structure, and accessibility-conscious component patterns.
- Existing product-specific editor domain modules remain as unreferenced legacy source for preservation; their public pages and APIs were retired from the active route tree.
- No `.openai/hosting.json` is present. Vercel remains the documented web target.

## Delivery strategy

The application is a modular monolith. PostgreSQL/Supabase is authoritative in production. Local development defaults to deterministic Houston fixtures and in-process adapters so every core workflow can be demonstrated without credentials. External providers are feature-flagged and cannot silently become data authorities.

## Milestones

### Milestone 0 - audit and decisions

- [x] Inventory application, configuration, tests, database, and CI.
- [x] Run baseline typecheck, lint, unit tests, and production build.
- [x] Document architecture, data model, security, and environment behavior.

### Milestone 1 - foundation

- [x] Marketplace shell, configurable branding, responsive design tokens, headers, footer, and error states.
- [x] Typed rental domain, deterministic total-cost engine, verification/freshness logic, and 100+ synthetic Houston fixtures.
- [x] Environment validation and mock/production provider selection.
- [x] Supabase normalized schema, PostGIS indexes, RLS, role helpers, audit/outbox tables, and seed guidance.
- [x] CI baseline for pnpm, lint, typecheck, unit tests, build, audit, and Playwright smoke tests.

### Milestone 2 - renter discovery

- [x] Home, Houston landing page, search results/map, listing detail, safety, help, and legal pages.
- [x] Shareable URL search state, faceted filters, sorting, list/map state, provenance, freshness, and verified-only behavior.
- [x] Search/listing/location/amenity/report APIs with Zod validation and consistent envelopes.
- [x] Search-provider interface with fixture fallback and Typesense schema/indexing boundary.

### Milestone 3 - renter accounts

- [x] Sign-in/sign-up demonstrations and production Supabase Auth boundary.
- [x] Saved listings, comparison, saved searches, contact requests, tours, notifications, and privacy preferences.
- [x] Mock-mode persistence in browser storage; production APIs remain server-authorized and RLS-backed.

### Milestone 4 - provider and moderation

- [x] Provider onboarding, attestation, listing editor, fee/concession entry, listings, leads, analytics, and settings.
- [x] Admin overview, moderation queue, provider review, reports, duplicates, imports, audit, and settings.
- [x] Lifecycle transitions with required reasons and verification-record-backed badges.

### Milestone 5 - operations and hardening

- [x] SEO metadata, sitemap/robots, structured data, analytics wrapper, email preview adapter, and import templates.
- [x] Accessibility smoke coverage, keyboard flows, reduced motion, security headers, and health/readiness endpoints.
- [x] Deployment, ingestion, moderation, fair-housing, backup, incident response, and rollback documentation.

## Definition of done

A feature is marked complete only when its interaction is wired to deterministic application state or a documented production adapter, validation exists at trust boundaries, and relevant automated checks pass. External-service-dependent behavior may be adapter-complete in local mock mode, but will be called out as requiring credentials before production use.

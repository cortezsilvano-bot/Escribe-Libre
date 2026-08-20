# API

All JSON endpoints return `{ ok, data, meta.requestId }` or `{ ok: false, error, meta.requestId }`. IDs are UUIDs, money is integer cents, dates are ISO-8601, and list endpoints are paginated. Consequential writes should send `Idempotency-Key` in production.

Public: `GET /api/search`, `GET /api/listings/:id`, `GET /api/locations/autocomplete`, `GET /api/amenities`, `POST /api/reports`.

Renter: saved listing/search CRUD, `POST /api/contact-requests`, and `POST /api/tour-requests`.

Provider: listing create/update/submit/renew, CSV validation import/template, leads read/update, and verification submission.

Admin: moderation queue, listing approve/reject/suspend, provider verify, duplicate merge, and search reindex. Every decision requires a written reason and emits an audit event.

Jobs/integrations: signed listing-provider webhooks, search-index and alert jobs, `/api/health`, and `/api/readiness`. QStash/webhook signature enforcement activates when signing keys are configured.

Mock mode validates the same shapes but returns ephemeral demo records. Production route handlers must be bound to verified Supabase sessions and RLS before accepting real data.


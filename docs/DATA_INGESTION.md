# Data Ingestion

Licensed providers implement `ListingSourceAdapter`; scraping third-party marketplaces is prohibited. Built-in boundaries cover direct submissions, CSV, JSON fixtures, and a disabled RentCast licensed-API adapter.

CSV workflow: download the template, upload, map columns, validate a preview, display per-row errors and duplicate candidates, then confirm. Imports use a provider-scoped idempotency key. A repeated file updates its import record rather than duplicating listings. Rollback disables source records and re-derives canonical listings; it does not destroy history.

Canonicalization preserves every source record, contact routing rule, display right, sync result, price, and availability event. Ambiguous duplicate candidates remain separate pending review.

Indexing uses `search_index_outbox`. Workers claim pending rows, retry with backoff, record errors, and move exhausted events to `dead_letter`. Full and incremental reindex operations are idempotent. The admin health view compares indexed counts/lag with PostgreSQL.

JSON fixtures are explicitly synthetic and local-only. Production startup must reject fixture publishing.


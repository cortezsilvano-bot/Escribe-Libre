# Security and Privacy

## Threat model and controls

- Authorization: production sessions use Supabase Auth. Route handlers derive the user from the server session, apply role checks, and rely on RLS as a second boundary.
- Input: Zod schemas validate query, JSON, CSV mappings, IDs, and lifecycle transitions. SQL access uses the Supabase client/parameterized APIs.
- Abuse: a typed rate-limit port uses an in-memory local implementation and Upstash Redis in production. Reports, leads, auth, imports, and job endpoints have distinct limits.
- Browser safety: React escaping is the default; provider HTML is not rendered. CSP and security headers restrict scripts, frames, MIME sniffing, referrers, and browser permissions.
- Uploads: production uses signed upload URLs, an allowlist for MIME/extensions, byte limits, image decoding/re-encoding, and a malware-scanning adapter. Review metadata references hosted identity workflows; raw sensitive identity files are not stored.
- Jobs/webhooks: signed requests, replay-safe webhook rows, and idempotency keys are required. Logs redact credentials and unnecessary PII.
- Auditability: provider verification, listing moderation, merges/unmerges, suspension, settings, and reindex actions write immutable audit events.

## Data minimization

The application does not collect or store Social Security numbers, credit/criminal/eviction reports, bank credentials, card data, biometric templates, unencrypted government IDs, or tenant-screening documents. Renter email and provider private contact details are not public. Analytics excludes message bodies, documents, tokens, and exact sensitive location.

## Housing and ranking safety

Protected characteristics and discriminatory proxies are not collected for ranking or targeting. Natural-language filters reject protected-class criteria. Rules-based content scanning creates a moderation flag rather than silently rewriting speech. Voucher acceptance and accessibility details are labeled provider-reported. No neighborhood safety or demographic score exists.

## Operational requirements before production

- Enable Supabase MFA for provider/admin accounts and review every RLS policy with integration tests.
- Configure hosted identity verification if identity checks are enabled; never accept raw documents through generic uploads.
- Configure secrets only in the deployment secret store, rotate webhook/signing keys, and enable Supabase point-in-time recovery.
- Run dependency/secret scanning, migration validation, Playwright/axe smoke tests, and incident-response exercises.
- Publish retention periods and complete data export/deletion workflows before accepting real users.


# Environment Configuration

## Local development

Copy `.env.example` to `.env.local`. No paid key is required for the default `APP_DATA_MODE=mock`. Mock mode uses synthetic inventory, a static map presentation, local email previews, and in-memory/local-browser workflow state.

Required in production:

- `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_URL`, `APP_DATA_MODE=supabase`
- Supabase public URL/anon key and server-only service role key
- Typesense host/protocol/port, search-only browser key, and server-only admin key
- Upstash Redis URL/token and QStash token/signing keys
- Mapbox public token and server-only secret token
- Resend API key and verified `EMAIL_FROM`
- Sentry DSN/auth token and PostHog public key/host when those services are enabled

Optional flags default to false: RentCast ingestion, AI search/summaries, SMS, and provider billing. Enabling a flag makes its related credentials mandatory during production validation.

## Commands

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
```

Environment variables prefixed with `NEXT_PUBLIC_` may reach the browser. Service role, admin, signing, email, SMS, AI, and billing credentials must remain server-only. The runtime validator reports missing variable names but never their values.


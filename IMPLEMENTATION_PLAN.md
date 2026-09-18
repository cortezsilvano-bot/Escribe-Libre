# Escribe Libre Implementation Plan

## Repository audit

- Product: a local-first Next.js 16 / React 19 / TypeScript word processor with
  an optional Tauri desktop shell (`upgrade/`).
- Package manager: npm is the documented default; `pnpm-lock.yaml` is retained
  for teams on pnpm 11.7. Use one per checkout.
- A rental-marketplace application was previously built over this repository and
  had taken over the active route tree, leaving the editor as unreferenced
  source. That product has been removed and the editor is the application again.
- Vercel, or any Node host, is the documented web target; `next.config.ts` emits
  a standalone server.

## Delivery strategy

The browser is the product. Document state, editing, pagination, and export are
client modules with no server dependency, so the app must remain fully usable
with no configuration, no account, and no network after first load. Server code
is added only when a capability genuinely cannot run in the browser, and every
storage boundary is schema-validated.

## Milestones

### Milestone 0 - foundation

- [x] Strict TypeScript, App Router, Vitest, Playwright, and CI baseline.
- [x] Zod document/version/comment schemas and the `DocumentRepository` port.
- [x] IndexedDB store with prefixed keys and a delete cascade.
- [x] Local preferences: theme, default page size, default font, autosave delay.

### Milestone 1 - editing core

- [x] Tiptap extension set: headings, lists, tables, links, images, highlight,
      text style/colour/size, alignment, underline.
- [x] Custom extensions: inline comment mark, page-break node, spellcheck
      decorations.
- [x] Word/character indexing and find/replace with case and whole-word options.
- [x] Paste handling with three modes and sanitisation on every path.

### Milestone 2 - document surface

- [x] Page geometry: size, orientation, per-edge margins, zoom, headers,
      footers, page numbers.
- [x] Editor shell: ribbon, inspector sidebar, floating selection toolbar,
      status bar, command palette.
- [x] Dashboard: document list, search, sort, starter templates, delete.
- [x] Full stylesheet and theming for both the light and neon-dark themes.

### Milestone 3 - files and history

- [x] Export DOCX, HTML, TXT, and `.textdoc`; back up and restore all documents.
- [x] Import `.textdoc`, HTML, and DOCX (`POST /api/import/docx`, sanitised
      server-side).
- [x] Named version snapshots with restore and delete.
- [x] Print/PDF view at `/documents/[id]/print`.

### Milestone 4 - routing and shell

- [x] `/` dashboard, `/documents/[id]` editor, `/documents/[id]/print`.
- [x] Metadata, manifest, robots, sitemap, offline service worker.
- [x] Security headers and CSP scoped to what the editor actually needs.
- [x] Health and readiness endpoints.

### Milestone 5 - open work

- [ ] True multi-page pagination: content currently flows in one page frame and
      page numbers render as `Page 1`. Measuring and splitting content across
      page frames is the largest remaining piece.
- [ ] Wire the Supabase adapter behind `DocumentRepository` so
      `APP_DATA_MODE=supabase` actually syncs; the schema exists, the adapter
      does not.
- [ ] Replace the five-word misspelling stub with a real dictionary.
- [ ] Share is a placeholder button; either implement sharing or remove it.
- [ ] `Edit`, `View`, `Format`, `Tools`, and `Extensions` menus all open the
      command palette rather than their own menus.

## Definition of done

A feature is complete when it is reachable from the running app, its state
survives a reload, validation exists at every trust boundary, and typecheck,
lint, unit tests, e2e tests, and the production build pass. A capability that
depends on credentials may be adapter-complete locally, but must be called out
as requiring configuration before production use.

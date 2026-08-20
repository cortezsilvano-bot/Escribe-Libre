# Textdoc Product And Architecture Plan

## Product Breakdown

Textdoc is a professional browser and hybrid-desktop word processor for structured, paginated documents. Its primary job is to give users a Word-like authoring surface in the browser while keeping the document source as validated ProseMirror/Tiptap JSON instead of fragile HTML.

Target users:
- Solo founders, legal/ops teams, consultants, writers, educators, and enterprise document teams.
- Users who need rich formatting, page setup, PDF/DOCX exchange, collaboration, review workflows, and reliable autosave.
- Future regulated teams that need ACLs, audit logs, version history, and controlled export.

Core problems solved:
- Browser editing without raw `contenteditable`/`execCommand` fragility.
- Clean semantic document state with formatting, styles, comments, and review data separated.
- Page-oriented editing and print/PDF output without making DOCX/PDF the canonical format.
- Local-first resilience and future Yjs collaboration.

Main user flows:
1. Create or open a document from the dashboard.
2. Edit content using the ribbon, contextual tools, styles, and page setup.
3. Autosave continuously to local IndexedDB now, Supabase later.
4. Import HTML/DOCX, normalize/sanitize, edit, export HTML/PDF/DOCX.
5. Share with collaborators, comment, suggest changes, accept/reject, and review history.

Essential MVP features:
- Tiptap editor with marks, paragraph formatting, lists, tables, links, images, styles, undo/redo.
- Page preview settings for Letter/A4/Legal, orientation, margins, zoom, and print CSS.
- Local document dashboard, autosave, empty/loading/error states.
- Find/replace, word count, HTML import/export, safe paste/import sanitization.
- Clear adapter boundary for Tiptap Pages Pro and Paged.js server export.

Advanced features:
- Official Tiptap Pages Pro, ConvertKit, and PagesTableKit when subscription access exists.
- Server Paged.js + headless Chromium PDF pipeline.
- Mammoth DOCX import and `docx` export.
- Supabase Auth/Postgres/RLS/Storage.
- Yjs + Hocuspocus collaboration, comments, tracked changes, version history.
- Object layer for floating images/text boxes/shapes, selection pane, TOC, footnotes, grammar, AI assist.
- Tauri/Electron hybrid desktop shell using the same Next.js app.

## Technical Architecture

Recommended stack:
- Frontend: Next.js App Router, React, TypeScript, Tiptap/ProseMirror, CSS modules/global CSS or Tailwind.
- Editor: Tiptap core MIT extensions now; Tiptap Pages Pro adapter later.
- Local resilience: IndexedDB through `idb-keyval`; service worker/PWA in V2.
- Backend: Supabase Auth/Postgres/Storage/RLS; separate Node worker for conversion.
- Collaboration: Yjs, y-prosemirror, Hocuspocus or managed Liveblocks/PartyKit.
- Export: Paged.js + Playwright/Puppeteer for server PDF; `docx` for DOCX export; Mammoth + DOMPurify for import.
- Security: DOMPurify, strict schema parsing, CSP, upload validation, RLS, rate limits, conversion sandboxing.

Frontend structure:
- App shell: dashboard, editor route, responsive navigation.
- Editor domain: extensions, commands, page settings, style registry, search index.
- UI components: ribbon, status bar, inspector, document canvas, empty/loading states.
- Data layer: document store interface with IndexedDB implementation now and Supabase implementation later.

Backend structure:
- `/api/documents`: document metadata and JSON save/load.
- `/api/import/docx`: upload, validate, Mammoth, sanitize, map to ProseMirror JSON.
- `/api/export/pdf`: ProseMirror JSON to semantic HTML + print CSS, Paged.js, headless Chromium PDF.
- `/api/export/docx`: ProseMirror JSON to `docx` sections/paragraphs/runs.
- `/api/assets`: image upload, MIME/magic-byte validation, storage signed URLs.
- `/api/collaboration/token`: document-scoped Yjs authorization.

Database design:
- `profiles(id, email, display_name, avatar_url, created_at)`
- `documents(id, owner_id, title, content jsonb, page_settings jsonb, style_registry jsonb, created_at, updated_at, deleted_at)`
- `document_acl(document_id, user_id, role owner|editor|commenter|viewer, created_at)`
- `document_versions(id, document_id, snapshot jsonb, label, created_by, created_at)`
- `yjs_updates(id, document_id, update bytea, clock bigint, created_at)`
- `comments(id, document_id, anchor jsonb, body, status open|resolved, created_by, created_at, updated_at)`
- `suggestions(id, document_id, range jsonb, kind insertion|deletion|modification, payload jsonb, status, author_id, created_at)`
- `assets(id, document_id, storage_path, mime_type, size_bytes, width, height, created_by, created_at)`
- `audit_events(id, actor_id, document_id, action, metadata jsonb, created_at)`

Authentication:
- Supabase Auth with email/password, magic link, and optional SSO.
- RLS enforces document ACL at the database.
- Server routes verify session and document role before reading/writing.
- Collaboration server validates JWT and document role before accepting Yjs updates.

Admin dashboard:
- User management, document ownership transfer, storage usage, export job logs, audit search, abuse/rate-limit events, plan limits, conversion failure queue.

Security considerations:
- Treat paste/import/upload as hostile.
- Sanitize HTML before ProseMirror parsing and again before any HTML rendering.
- Never embed base64 images in document JSON.
- Limit file size and verify MIME plus magic bytes.
- Reject pathological DOCX blocks that exceed page height before Pages Pro layout.
- Use CSP, Trusted Types where supported, HTTPS-only clipboard features, rate limits, and isolated conversion workers.

Hosting/deployment:
- Vercel for Next.js app and edge/server routes.
- Supabase for Postgres/Auth/Storage.
- Upstash Redis for rate limits, queues, and presence.
- A dedicated Node worker for Playwright/Paged.js PDF and heavy DOCX jobs.
- Tauri desktop wrapper in V3 if offline desktop distribution becomes a priority.

## Development Plan

MVP:
1. Local-first editor shell with Tiptap core, dashboard, autosave, page settings, HTML import/export.
2. Add Supabase Auth/RLS and cloud persistence.
3. Add server PDF export with Paged.js and print metric reconciliation.
4. Add semantic DOCX import/export.

Version 2:
- Official Tiptap Pages Pro integration, headers/footers, page breaks, page numbers.
- Yjs collaboration, comments, presence, version snapshots.
- Tables tuned for pagination and import validation.

Version 3:
- Track changes, advanced object layer, footnotes/endnotes, TOC, grammar, AI assist, enterprise admin, desktop hybrid.

Estimated modules:
- 8 app screens, 20-30 shared components, 10 editor extensions/adapters, 8 backend route groups, 10 database tables.

Folder structure:
```text
src/app
  page.tsx
  documents/[id]/page.tsx
src/components
  dashboard
  editor
  layout
src/lib
  documents
  editor
  pagination
  security
  validation
docs
```

## API Route Plan

- `GET /api/documents`
- `POST /api/documents`
- `GET /api/documents/:id`
- `PATCH /api/documents/:id`
- `DELETE /api/documents/:id`
- `POST /api/documents/:id/versions`
- `GET /api/documents/:id/comments`
- `POST /api/documents/:id/comments`
- `POST /api/import/html`
- `POST /api/import/docx`
- `POST /api/export/html`
- `POST /api/export/pdf`
- `POST /api/export/docx`
- `POST /api/assets`
- `POST /api/collaboration/token`

## Risks And Fixes

- Pagination fidelity: use Tiptap Pages Pro for editing and Paged.js server export as the print backstop.
- Pages infinite loops on unsplittable blocks: cap row/object heights and validate imports.
- DOCX round trip loss: keep ProseMirror JSON canonical and disclose fidelity limits.
- XSS through paste/import: DOMPurify plus schema parsing plus CSP.
- Large documents: split by sections/chapters, debounce expensive work, workerize search/export.
- Collaboration conflicts: Yjs from the start for shared docs, scoped undo, periodic snapshots.
- Scope creep: keep each phase shippable and avoid building object layout before pagination/export is proven.

## Phase Implementation Prompts

Phase 0:
> Build a Next.js/Tiptap local-first editor shell with typed document model, IndexedDB autosave, ribbon controls, page settings, import/export HTML, and validation.

Phase 1:
> Add Supabase Auth/Postgres/RLS persistence, document ACLs, asset uploads, and a migration-backed schema matching the architecture plan.

Phase 2:
> Integrate Tiptap Pages Pro behind the pagination adapter and build a Paged.js + Playwright PDF export route with page metric tests.

Phase 3:
> Add DOCX import/export using Mammoth, DOMPurify, and docx mapping with golden fixture tests.

Phase 4:
> Add Yjs/Hocuspocus collaboration, presence, comments, version history, and scoped undo.

Phase 5:
> Add suggestions/track changes, advanced object arrangement, admin dashboard, AI assist, and desktop hybrid packaging.

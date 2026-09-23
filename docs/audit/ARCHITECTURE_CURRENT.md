# Current architecture

Source audit: 2026-09-22. The baseline below describes the source before the foundation changes in this working tree, not deployed services.

## Foundation changes (2026-09-23)

The canonical record schema now lives in `src/lib/schema/document.ts`, with the old import path re-exporting it. Version 1 preserves the existing record layout; unversioned records migrate through validation and persist the version on successful reads/writes. Content is bounded JSON checked against the shared Tiptap schema, including attribute and URL checks. Empty legacy documents normalize to an empty paragraph. DOCX export validates an explicit projection of this schema, and native exports validate whole records.

Storage now uses `StorageAdapter` and `indexedDbAdapter`, preserving database/key names. Invalid or future-version records raise an error without overwriting the original. Snapshot reads return migrated data and restoration keeps the version. Print reports load errors. These changes do not implement native filesystem storage, asset lifecycle management, the complete styles/sections/references/review envelope, deterministic layout, or the rest of P0.

Regression coverage includes actual ProseMirror JSON, all shipped templates, migration, future versions, invalid trees, nonserializable data, unsafe URL schemes, corrupt-record preservation and snapshot migration.

The primary app is Next.js App Router (`src/app`) with client-side Tiptap editing in `src/components/editor/DocumentEditor.tsx`. The dashboard manages local documents. Print uses a read-only Tiptap view. Tauri packages the Next static export; web builds retain health/readiness routes and security headers.

## Editor and models

`src/lib/editor/editor-extensions.ts` shares StarterKit (headings 1–3, lists, links, underline), TextAlign, TextStyleKit, multicolor Highlight, block Image, resizable TableKit, InlineComment, SpellCheckIndicator and PageBreak between editor and print.

`document-model.ts` defines Zod records, snapshots, comments and page settings. Content is `z.unknown()` and records lack a schema version. The ProseMirror schema is another structural authority, without boundary validation connecting it to records.

`upgrade/` is a separate Vite editor with a different extension set, localStorage persistence and html2pdf output. It is not the primary app's canonical editor.

## Storage

`document-store.ts` directly uses idb-keyval: database `textdoc`, store `documents`, prefixes `document:`, `version:` and `comment:`. Invalid reads become null or are omitted. `ensureDocument` creates a replacement when a read returns null. Related deletions use separate operations.

The repository interface has no app consumers; components import the store. Desktop also uses webview IndexedDB, with no native document filesystem adapter. Settings use localStorage. Native backups contain document records, excluding comments and snapshots.

Supabase clients and SQL exist but are disconnected from document persistence. Setting the environment mode does not implement sync. SQL uses UUIDs; local documents use nanoid IDs.

## Import, export and layout

- Native files wrap records in format version 1; this is not an IDM schema version. Import creates new IDs and timestamps.
- DOCX import runs Mammoth, DOMPurify and Tiptap HTML ingestion in the browser. Compressed input is limited to 20 MB. Conversion is semantic, not lossless.
- DOCX export traverses Tiptap JSON with `docx`: basic paragraphs, headings, formatting, lists, tables, page breaks and global settings. Images, links, nested lists, merged cells and review data need compatibility work.
- PDF uses browser printing. `page-settings.ts` computes dimensions and CSS variables, with no layout worker or deterministic page flow. Print renders one frame with a literal `Page 1` footer.

## Engineering baseline

Vitest covers defaults, templates, extension registration and text indexing. Playwright covers creation/deletion, editing persistence, formatting, menus, print navigation and automated accessibility. CI runs environment checks, typecheck, lint, unit tests, build, Chromium E2E, dependency audit, migration pattern checks and secret scanning.

No DOCX round-trip or pagination golden corpus was found. Reload persistence coverage does not establish crash durability. Manual accessibility checks are documented in `docs/ACCESSIBILITY_TESTING.md`.

Keep DOM-based Tiptap editing. Introduce one versioned canonical model with explicit editor, storage and export projections. Deterministic layout should later consume it and produce shared page/PDF output.

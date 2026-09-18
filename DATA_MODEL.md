# Data Model

The authoritative definitions live in `src/lib/documents/document-model.ts` as
Zod schemas. Everything read from storage is parsed through them, so this
document and the code cannot drift silently.

## Entities

### `DocumentRecord`

| Field | Type | Notes |
|---|---|---|
| `id` | string | `nanoid(10)`, also the URL segment |
| `title` | string | trimmed, 1-120 characters |
| `content` | unknown | a ProseMirror/Tiptap JSON document |
| `pageSettings` | `PageSettings` | see below |
| `createdAt` / `updatedAt` | ISO-8601 datetime | `updatedAt` is rewritten on every save |

### `PageSettings`

| Field | Type | Range |
|---|---|---|
| `size` | `letter` \| `a4` \| `legal` | |
| `orientation` | `portrait` \| `landscape` | |
| `margins` | `{ top, right, bottom, left }` inches | 0.25 - 2 each |
| `zoom` | number | 0.5 - 2 |
| `headerText` / `footerText` | string | up to 200 characters |
| `showPageNumbers` | boolean | |

Pixel geometry is derived, not stored: `src/lib/pagination/page-settings.ts`
maps a size and orientation to pixel dimensions at 96 px/inch and emits
`--page-width`, `--page-height`, `--page-margin-*`, and `--page-zoom`.

### `DocumentVersion`

A snapshot of `title`, `content`, and `pageSettings` for one `documentId`, plus
a user-supplied `label` and `createdAt`. Versions are independent of the
document: deleting a version never touches the document.

### `DocumentComment`

`documentId`, `body` (1-1000 characters), optional `quote` (up to 300
characters of the selected text), optional `from`/`to` document positions,
`resolved`, `createdAt`, `updatedAt`. A comment with positions also has a
matching `inlineComment` mark in the document content.

## Local storage layout

One IndexedDB database, `textdoc`, object store `documents`, with prefixed keys:

| Key | Value |
|---|---|
| `document:<id>` | `DocumentRecord` |
| `version:<documentId>:<versionId>` | `DocumentVersion` |
| `comment:<documentId>:<commentId>` | `DocumentComment` |

Prefixing keeps a delete cascade cheap: removing a document also removes every
key beginning `version:<id>:` and `comment:<id>:`.

Preferences are separate, in `localStorage` under `textdoc:settings`
(theme, default page size, default font, autosave delay).

## File formats

- `.textdoc` - a single document as JSON: one `DocumentRecord`.
- `.textdoc-backup` - every document as a JSON array, used by **Backup all** and
  **Restore backup**.

Both are validated on read with the same schemas, so a truncated or foreign file
is reported as an error instead of partially imported.

## Invariants

- A document id is stable for the life of the document; imports keep the id in
  the file, so re-importing a `.textdoc` overwrites rather than duplicates.
- `updatedAt` is set by the store on save, never by a caller.
- Restoring a version preserves the document's original `createdAt`.
- A comment may exist without an inline mark (a document-level note), but an
  inline mark should always have a matching comment record.
- Margins, zoom, and text lengths are clamped by schema, so an out-of-range
  value fails the save instead of producing an unrenderable page.

## Optional server schema

`supabase/migrations/0001_initial_schema.sql` mirrors these entities for
`APP_DATA_MODE=supabase`: `profiles`, `documents`, `document_acl`,
`document_versions`, and comment/suggestion tables, with row-level security
scoped by document ACL. It is unused in the default local-first mode.

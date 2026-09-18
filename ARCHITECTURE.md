# Architecture

## Shape

Escribe Libre is a Next.js App Router application whose product logic runs in
the browser. The document model, editing commands, pagination, export, and
persistence are all client-side modules. Nothing about editing needs a server,
which is why the same code ships as a web app and as a desktop bundle.

```text
Browser
  |
  |-- React / Next.js App Router pages
  |     /                      -> document dashboard
  |     /editor?doc=<id>       -> editor
  |     /print?doc=<id>        -> print + PDF view
  |
  |-- Editor core (Tiptap + ProseMirror)
  |     extensions: inline comments, page break, spellcheck indicator
  |
  |-- Document services
  |     document-model (Zod schemas)  pagination  export (docx/html/txt)
  |
  |-- DocumentRepository port
        `-> IndexedDB adapter (idb-keyval)      [default]
        `-> Supabase adapter                    [optional, APP_DATA_MODE=supabase]

Server (web build only; the desktop build is a static export)
  GET  /api/health, /api/readiness
```

## Authority boundaries

- The browser's IndexedDB store is the system of record in the default mode.
  Nothing leaves the device unless the user exports a file.
- Every record crossing a persistence boundary is parsed with a Zod schema
  (`documentRecordSchema`, `documentVersionSchema`, `documentCommentSchema`), so
  a corrupt or hand-edited entry is rejected rather than rendered.
- All pasted and imported HTML is sanitised in the browser before it reaches
  the editor, on every path: paste, HTML import, and DOCX import.
- Page geometry is derived from `PageSettings` by the pagination module, never
  from ad-hoc CSS in components.

## Application modules

- `src/lib/documents`: document/version/comment schemas, the IndexedDB store,
  the repository port, starter templates, and the `.textdoc` file format.
- `src/lib/editor`: the Tiptap extension set, the custom inline-comment mark,
  the page-break node, the spellcheck decoration plugin, and text indexing for
  word counts and find/replace.
- `src/lib/pagination`: page sizes, orientation, margins, and zoom resolved into
  CSS custom properties.
- `src/lib/export`: DOCX generation and browser file downloads.
- `src/lib/settings`: local preferences (theme, default page size and font,
  autosave delay) in `localStorage`.
- `src/components/dashboard`: the document list, templates, search, and backup.
- `src/components/editor`: the editor shell, ribbon, inspector sidebar,
  selection toolbar, status bar, and print view.
- `src/app`: pages and route handlers.
- `supabase/migrations`: the optional server schema for synced documents.

## Runtime modes

`APP_DATA_MODE=mock` is the default and needs no configuration: documents live
in IndexedDB and the app is fully functional offline after first load, backed by
the service worker in `public/sw.js`.

`APP_DATA_MODE=supabase` is opt-in. It requires validated Supabase credentials
and enables durable, account-scoped documents. `GET /api/readiness` reports
which dependencies are configured.

## Editing model

The editor holds one Tiptap instance. `onUpdate` recomputes word and character
counts and schedules a debounced save (300/600/1000 ms, a user preference).
Title and page-setting edits schedule the same save, so a single writer owns
persistence. A `beforeunload` guard and an in-app confirmation block navigation
while a save is pending or failed.

Comments are stored twice on purpose: as a record in the document store, and as
an `inlineComment` mark carrying the comment id on the selected range, so the
highlight survives editing and the sidebar stays authoritative for the thread.

Version snapshots are full copies of title, content, and page settings taken on
demand. Restoring one writes it back as the current document.

## Deployment

Two builds come out of one codebase, selected by `DESKTOP_BUILD`:

- **Web** (`npm run build`) emits a standalone Next.js server that runs anywhere
  Node runs, keeping the security headers and the health/readiness handlers.
- **Desktop** (`npm run build:desktop`) emits a static export to `out/`, which
  Tauri bundles. `pageExtensions` drops the `.ts` route handlers from this build,
  since a static bundle cannot host them.

Security headers and a strict Content-Security-Policy are set in
`next.config.ts` for the web build, and in `src-tauri/tauri.conf.json` for the
desktop shell.

# Escribe Libre

A local-first word processor for the browser. Documents are stored in your own
browser, so the app works with no account, no server, and no API keys.

Escribe Libre ships two surfaces that share the same editing model:

- The root **Next.js application** is the full workspace: a document dashboard
  plus the editor, with page layout, comments, version snapshots, find and
  replace, DOCX/HTML/TXT import and export, and a print/PDF view.
- The **`upgrade/` application** is a focused single-document editor built with
  Vite and packaged for Windows with Tauri 2.

## Features

| Area | What you get |
|---|---|
| Writing | Tiptap/ProseMirror rich text, headings, lists, tables, links, images, highlights, text colour and alignment |
| Page layout | Letter/A4/Legal, portrait or landscape, per-edge margins, headers, footers, page numbers, manual page breaks, zoom |
| Review | Anchored inline comments, resolve/reopen, a simple misspelling indicator, find and replace with case and whole-word options |
| History | Named local version snapshots you can restore or delete |
| Files | Import `.docx` and `.html`, export `.docx`, `.html`, `.txt`, `.textdoc`, print or save as PDF, and back up or restore every document at once |
| Storage | IndexedDB on your device, with autosave and an unsaved-changes guard |

## Quick start

```bash
npm install
npm --prefix upgrade install
npm run dev
```

Open `http://localhost:3000`. The dashboard lists your documents; **New
document** or any template opens the editor at `/documents/<id>`.

No environment file is required. `.env.example` documents the optional
Supabase variables used only when you enable account-backed sync.

New here? **[docs/INSTALL.md](docs/INSTALL.md)** covers prerequisites, the
standalone editor in `upgrade/`, the optional desktop build, and troubleshooting.

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl/Cmd + K` | Command palette |
| `Ctrl/Cmd + S` | Save a `.textdoc` file |
| `Ctrl/Cmd + Shift + S` | Export plain text |
| `Ctrl/Cmd + P` | Open the print / PDF view |
| `Ctrl/Cmd + Alt + B` | Insert a page break |

## Verification

```bash
npm run typecheck
npm run lint
npm run test
npx playwright install chromium
npm run test:e2e
npm run build
```

`npm run release:check` runs the complete JavaScript verification sequence. The
project also retains its `pnpm-lock.yaml` for teams using pnpm; use one package
manager consistently per checkout.

## Desktop release

The desktop app is a self-contained Tauri bundle of `upgrade/dist`. It does not
depend on the source directory or a separately installed Node runtime at
runtime.

```bash
npm run desktop:dev
npm run release:desktop
```

On Windows, `release:desktop` produces Tauri installers under
`src-tauri/target/release/bundle/`, including NSIS and MSI outputs when the Rust
toolchain and Visual Studio C++ workload are installed. See
[docs/desktop.md](docs/desktop.md) for prerequisites and troubleshooting.

## Architecture

Next.js App Router with strict TypeScript. The editor is a client component
tree over Tiptap; persistence is an IndexedDB repository behind a narrow
`DocumentRepository` port, so a server-backed implementation can be added
without touching the editor. The only server work is `POST /api/import/docx`,
which converts an uploaded Word file to sanitised HTML.

Read [`ARCHITECTURE.md`](ARCHITECTURE.md), [`DATA_MODEL.md`](DATA_MODEL.md),
[`SECURITY.md`](SECURITY.md), [`ENVIRONMENT.md`](ENVIRONMENT.md), and the
`docs/` runbooks.

## Optional sync

Everything above works offline. If you want documents on more than one device,
apply `supabase/migrations` to a clean Supabase project, set the Supabase
variables, and switch `APP_DATA_MODE=supabase`. See
[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Intentionally excluded

Real-time multi-user collaboration, server-side PDF rendering, a template
marketplace, and AI writing features are not implemented.

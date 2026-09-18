# Installation Guide

Get Escribe Libre running on your machine in about five minutes. Every command
below can be copy-pasted as-is.

---

## What you get

| If you run… | You get |
|---|---|
| `npm run dev` (the main app) | The **word processor**: document dashboard at `/`, editor at `/editor?doc=<id>` |
| `npm run dev` inside `upgrade/` | An older **standalone single-document editor**, kept for reference |

The main app is the product: it has the document library, templates, backups,
versions, comments, and the print view, and it is what the desktop installer
now ships. `upgrade/` predates it and is no longer part of the release.

---

## Part 1 — Run the app

### Step 1: Install the prerequisites

You need **Node.js 24**. npm ships with it.

```bash
node --version    # want v24.x
npm --version
```

Install Node 24 if that first command failed or showed an older version:

- **Windows / macOS:** download the LTS installer from [nodejs.org](https://nodejs.org)
- **macOS with Homebrew:** `brew install node@24`
- **Linux:** `curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash - && sudo apt install -y nodejs`

> **npm or pnpm?** Either works. The repo keeps both `pnpm-lock.yaml` and the
> npm scripts; `pnpm-workspace.yaml` carries security overrides that only apply
> on pnpm. Pick one per checkout and stay with it. This guide uses npm.

### Step 2: Get the code

```bash
git clone https://github.com/cortezsilvano-bot/Escribe-Libre.git
cd Escribe-Libre
```

### Step 3: Install dependencies

```bash
npm install
```

Takes a minute or two the first time.

### Step 4: Start it

```bash
npm run dev
```

Open **<http://localhost:3000>**.

**You do not need a config file or any API key.** The app defaults to
`APP_DATA_MODE=mock`, which keeps every document in your browser. Cloud sync is
optional and covered in [Part 3](#part-3--optional-connect-supabase).

Press `Ctrl+C` in the terminal to stop the server.

### Step 5: Try it

1. Click **New document**, or pick a template.
2. Type. The status bar counts words; edits autosave after ~600 ms.
3. Open the **Inspector** panel (right) to set page size, margins, a header, or
   a footer, and to add comments and version snapshots.
4. **File → Export DOCX**, or `Ctrl+P` for the print/PDF view.
5. Go back to `/` — your document is in the list.

### Did it work?

Run this in a second terminal while `npm run dev` is running:

```bash
curl http://localhost:3000/api/health
```

You should see this — the payload is nested under `data`:

```json
{"ok":true,"data":{"status":"healthy","service":"escribe-libre-web","mode":"mock"},"meta":{...}}
```

`"mode":"mock"` confirms it is running entirely on browser storage with no
external services, which is what you want for a first run.

> **Where do documents live?** In this browser profile's IndexedDB, under the
> `textdoc` database. Clearing site data deletes them permanently, and there is
> no server copy. Use **Backup all** on the dashboard before you clean anything.

---

## Part 2 — Run the standalone editor

An older single-document editor, kept for reference. It lives in its own folder
with its own dependencies and does **not** share the main app's install. The
desktop installer no longer packages it.

```bash
cd upgrade
npm install
npm run dev
```

Two things to know:

- Its `README.md` mentions a `GEMINI_API_KEY`. **You don't need one.** Nothing
  in `upgrade/src/` calls that API; the dependency is unused.
- It wants **port 3000**, same as the main app. Stop the main app first, or run
  `npm run dev -- --port=3001`.

---

## Part 3 — Optional: connect Supabase

Only needed if you want accounts and cross-device sync. Skip it otherwise —
local mode is fully functional without it.

1. Create a project at [supabase.com](https://supabase.com).
2. Apply the migrations in order:
   ```bash
   supabase db push
   ```
3. Copy the example config and fill in the three values, then set
   `APP_DATA_MODE=supabase`:
   ```bash
   cp .env.example .env.local     # Windows PowerShell: copy .env.example .env.local
   ```
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   ```
4. Confirm the config is valid:
   ```bash
   npm run verify:env
   ```

`SUPABASE_SERVICE_ROLE_KEY` is server-only. Never expose it to the browser and
never prefix it with `NEXT_PUBLIC_`.

> **Status:** the schema and credentials plumbing exist, but the Supabase
> implementation of `DocumentRepository` is not written yet, so documents still
> save locally. Tracked in `IMPLEMENTATION_PLAN.md`, Milestone 5.

---

## Part 4 — Optional: build the desktop app

The desktop shell uses [Tauri 2](https://tauri.app) and bundles the word
processor as a static export.

**Extra prerequisites:**

- The Rust toolchain (`rustc`, `cargo`) — install from [rustup.rs](https://rustup.rs)
- **Windows:** Visual Studio Build Tools with MSVC and the Windows SDK
- **macOS:** Xcode Command Line Tools (`xcode-select --install`)
- **Linux:** `webkit2gtk` and `libayatana-appindicator` development packages

**Commands:**

```bash
npm run desktop:dev      # run the desktop shell in development
npm run desktop:build    # produce an installer
npm run release:desktop  # full build, then the installer
```

The build produces an NSIS `-setup.exe` and a WiX `.msi` under
`src-tauri/target/release/bundle/`. If the MSI step fails with
`Access is denied (os error 5)`, a previous `.msi` is still locked by another
process; close it (or any running installer) and build again. The NSIS installer
is unaffected.

Prebuilt installers are not kept in this repository. They are build artifacts
and belong in GitHub Releases.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Port 3000 already in use | `npm run dev -- --port 3001`, or stop whatever is on 3000. |
| `Cannot find module '@/...'` | You are in the wrong folder. Run commands from the repo root, or from `upgrade/` for the standalone editor. |
| Dashboard is empty after it worked before | Documents are per-browser-profile. A different browser, a private window, or cleared site data means a different (empty) store. |
| DOCX import fails | Only `.docx` is supported, up to 20 MB. Legacy `.doc` and password-protected files are rejected. |
| Editor loads but looks unstyled | A stale build. Stop the server, delete `.next/`, and run `npm run dev` again. |
| Build fails after pulling changes | `npm install` again; dependencies likely moved. |
| Tauri build fails on Windows | MSVC and the Windows SDK are missing. See Part 4. |

---

## Command reference

Run these from the repo root.

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server on port 3000 |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript check, no output files |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | Browser tests (Playwright, port 3107) |
| `npm run verify` | Everything above, in sequence — matches CI |
| `npm run verify:env` | Validate `.env.local` without printing secrets |

Before your first `npm run test:e2e`, install the browser once:

```bash
npx playwright install chromium
```

---

## Where to go next

- **[README.md](../README.md)** — what the project is
- **[ARCHITECTURE.md](../ARCHITECTURE.md)** — how it is structured
- **[DATA_MODEL.md](../DATA_MODEL.md)** — document, version, and comment shapes
- **[ENVIRONMENT.md](../ENVIRONMENT.md)** — every environment variable
- **[docs/DEPLOYMENT.md](DEPLOYMENT.md)** — deploying to production
- **[docs/desktop.md](desktop.md)** — desktop packaging detail

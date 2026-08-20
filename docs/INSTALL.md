# Installation Guide

Get the project running on your machine in about five minutes. Every command
below can be copy-pasted as-is.

---

## Before you start: what actually runs today

This repository is mid-transition, and the install experience reflects that.
Reading this first will save you confusion:

| If you run… | You get |
|---|---|
| `pnpm dev` (the main app) | A **rental marketplace** — search, listings, provider and admin dashboards |
| `pnpm dev` inside `upgrade/` | A **standalone text editor** prototype |

The main app also contains a full Tiptap text editor
(`src/components/editor/`, ~1,700 lines) — but **no page currently renders
it**, so you cannot reach it in the browser. It is code in the tree, not a
running feature. Same for `src/components/dashboard/Dashboard.tsx`.

If you came here to see the editor, use **[Part 2](#part-2--run-the-editor-prototype)**.

---

## Part 1 — Run the main app

### Step 1: Install the prerequisites

You need **Node.js 24** and **pnpm 11.7**.

**Check what you already have:**

```bash
node --version    # want v24.x
pnpm --version    # want 11.7.x
```

**Install Node 24** if that first command failed or showed an older version:

- **Windows / macOS:** download the LTS installer from [nodejs.org](https://nodejs.org)
- **macOS with Homebrew:** `brew install node@24`
- **Linux:** `curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash - && sudo apt install -y nodejs`

**Install pnpm** — the easiest way is Corepack, which ships with Node and
reads the exact version this project expects straight from `package.json`:

```bash
corepack enable pnpm
```

> **Why not npm?** This project is pinned to `pnpm@11.7.0` and its lockfile is
> `pnpm-lock.yaml`. Using npm or yarn will produce a different dependency tree
> and the security overrides in `pnpm-workspace.yaml` will be ignored.

### Step 2: Get the code

```bash
git clone https://github.com/cortezsilvano-bot/Escribe-Libre.git
cd Escribe-Libre
```

### Step 3: Create your config file

```bash
cp .env.example .env.local
```

**You do not need to edit it or supply any API keys.** The defaults run the
app in `APP_DATA_MODE=mock`, which uses 108 synthetic Houston listings and
needs no paid service. Cloud sync is optional and covered in
[Part 3](#part-3--optional-connect-supabase).

On Windows PowerShell, use `copy .env.example .env.local` instead.

### Step 4: Install dependencies

```bash
pnpm install
```

Takes a minute or two the first time.

### Step 5: Start it

```bash
pnpm dev
```

Open **<http://localhost:3000>**.

Good pages to try: `/search`, `/saved`, `/compare`,
`/provider/listings/new`, `/admin`.

Press `Ctrl+C` in the terminal to stop the server.

### Did it work?

Run this in a second terminal while `pnpm dev` is running:

```bash
curl http://localhost:3000/api/health
```

You should see this — the payload is nested under `data`:

```json
{"ok":true,"data":{"status":"healthy","service":"rental-marketplace-web","mode":"mock"},"meta":{...}}
```

`"mode":"mock"` confirms it is running on synthetic data with no external
services, which is what you want for a first run.

---

## Part 2 — Run the editor prototype

This is the standalone word processor, in its own folder with its own
dependencies. It does **not** share the main app's install.

```bash
cd upgrade
npm install
npm run dev
```

Open **<http://localhost:3000>**.

Three things to know:

- It uses **npm**, not pnpm — it has a `package-lock.json`, not a pnpm lockfile.
- Its `README.md` tells you to set a `GEMINI_API_KEY`. **You don't need one.**
  Nothing in `upgrade/src/` actually calls the Gemini API; the dependency is
  unused. Skip that step.
- It wants **port 3000**, same as the main app. Stop the main app first, or
  run `npm run dev -- --port=3001`.

---

## Part 3 — Optional: connect Supabase

Only needed if you want accounts and cross-device sync. Skip it otherwise —
mock mode is fully functional without it.

1. Create a project at [supabase.com](https://supabase.com).
2. Apply the migrations in order:
   ```bash
   supabase db push
   ```
   Load `supabase/seed.sql` **only** in a development project, never production.
3. Fill these into `.env.local`, then set `APP_DATA_MODE=supabase`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   ```
4. Confirm the config is valid:
   ```bash
   pnpm verify:env
   ```

`SUPABASE_SERVICE_ROLE_KEY` is server-only. Never expose it to the browser and
never prefix it with `NEXT_PUBLIC_`.

---

## Part 4 — Optional: build the desktop app

The desktop shell uses [Tauri 2](https://tauri.app). This is the most
involved path, and **it does not currently build to a finished binary** — see
the note at the end.

**Extra prerequisites:**

- The Rust toolchain (`rustc`, `cargo`) — install from [rustup.rs](https://rustup.rs)
- **Windows:** Visual Studio Build Tools with MSVC and the Windows SDK
- **macOS:** Xcode Command Line Tools (`xcode-select --install`)
- **Linux:** `webkit2gtk` and `libayatana-appindicator` development packages

**Commands:**

```bash
pnpm desktop:dev              # run the desktop shell in development
pnpm desktop:prepare-sidecar  # bundle the Next.js server for packaging
pnpm desktop:build            # produce an installer
```

> **Known blocker:** `docs/desktop.md` records that the Windows binary build
> is blocked pending a successful MSVC and Windows SDK install (the Build
> Tools installer failed with `0x80070070`, `ERROR_DISK_FULL`). Also note
> that packaging expects an `/api/import/docx` endpoint that **does not exist
> yet** — `src/app/api/import/docx/` contains no `route.ts`.

Prebuilt installers are not kept in this repository. They are build artifacts
and belong in GitHub Releases.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `pnpm: command not found` | Run `corepack enable pnpm`. If that fails, `npm install -g pnpm@11.7.0`. |
| `ERR_PNPM_FROZEN_LOCKFILE_WITH_OUTDATED_LOCKFILE` | Run plain `pnpm install` — the `--frozen-lockfile` flag is for CI. |
| Port 3000 already in use | `pnpm dev --port 3001`, or stop whatever is on 3000. |
| `Cannot find module '@/...'` | You are in the wrong folder. Run commands from the repo root, or from `upgrade/` for the prototype. |
| Editor is nowhere in the UI | Expected — it is not wired to a route. See the table at the top. |
| Build fails after pulling changes | `pnpm install` again; dependencies likely moved. |
| Tauri build fails on Windows | MSVC and the Windows SDK are missing. See Part 4. |

---

## Command reference

Run these from the repo root.

| Command | What it does |
|---|---|
| `pnpm dev` | Start the dev server on port 3000 |
| `pnpm build` | Production build |
| `pnpm typecheck` | TypeScript check, no output files |
| `pnpm lint` | ESLint |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm test:e2e` | Browser tests (Playwright, port 3107) |
| `pnpm verify` | Everything above, in sequence — matches CI |
| `pnpm verify:env` | Validate `.env.local` without printing secrets |

Before your first `pnpm test:e2e`, install the browser once:

```bash
pnpm exec playwright install chromium
```

---

## Where to go next

- **[README.md](../README.md)** — what the project is
- **[ARCHITECTURE.md](../ARCHITECTURE.md)** — how it is structured
- **[ENVIRONMENT.md](../ENVIRONMENT.md)** — every environment variable
- **[docs/DEPLOYMENT.md](DEPLOYMENT.md)** — deploying to production
- **[docs/desktop.md](desktop.md)** — desktop packaging detail

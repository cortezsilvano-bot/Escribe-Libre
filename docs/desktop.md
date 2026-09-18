# Escribe Libre Desktop

The desktop shell uses Tauri 2 and packages the word processor itself — the same
app you get on the web, built as a static export.

## How it is wired

`npm run build:desktop` runs `next build` with `DESKTOP_BUILD=1`, which switches
`next.config.ts` to `output: "export"` and writes a static bundle to `out/`.
`src-tauri/tauri.conf.json` points `frontendDist` at `../out`, so the installer
carries the dashboard, editor, and print view.

Because a static bundle cannot host route handlers, that build also narrows
`pageExtensions` to `.tsx`, which drops `/api/health`, `/api/readiness`, and the
robots/sitemap metadata routes. None of them are meaningful in a desktop app.
Everything else works offline, including DOCX import, which runs in the browser.

Documents live in the installed application's own local storage profile, not in
the installation directory.

> `upgrade/` is an older standalone single-document editor. It is no longer part
> of the desktop release.

## Prerequisites

- Rust toolchain with `cargo` and `rustc`.
- Visual Studio Build Tools with MSVC and a Windows SDK.
- Node dependencies installed with `npm install` at the repository root.

`scripts/run-tauri.cmd` locates Visual Studio with `vswhere`, falls back to
`F:\VSBuildTools`, puts `%USERPROFILE%\.cargo\bin` on `PATH`, and redirects
`TEMP` beside the repository so the build does not fill `C:`.

## Commands

```bash
npm run desktop:dev      # run the shell against the dev server
npm run desktop:build    # produce installers
npm run release:desktop  # full build, then installers
```

## Output

```
src-tauri/target/release/bundle/
├── nsis/Escribe Libre_<version>_x64-setup.exe    <- the installer most people want
└── msi/Escribe Libre_<version>_x64_en-US.msi     <- for managed deployment
```

These are build artifacts. `.gitignore` excludes `src-tauri/target/`, so ship
them through GitHub Releases rather than committing them.

## Troubleshooting

**`failed to bundle project: Access is denied. (os error 5)` during the MSI
step.** A previous `.msi` at that path is still locked by another process, and
WiX cannot overwrite it. Close anything holding it — an open installer, an
Explorer preview pane, or an antivirus scan — then build again. The NSIS
installer is produced before this step and is unaffected.

**`link.exe` not found, or MSVC errors.** The Visual Studio Build Tools are
missing or `vswhere` did not find them. Install the "Desktop development with
C++" workload with the Windows SDK. A past install attempt on this machine
failed with `0x80070070` (`ERROR_DISK_FULL`); free space on `C:` is required
even when the install target and temp folder are moved to another drive.

**The installer runs but the window is blank.** `out/` is missing or stale. Run
`npm run build:desktop` and confirm `out/index.html` exists before bundling.

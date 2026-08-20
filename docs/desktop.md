# Textdoc Desktop

The desktop shell is scaffolded with Tauri 2.

## Prerequisites

- Rust toolchain with `cargo` and `rustc`.
- Visual Studio Build Tools with MSVC and a Windows SDK.
- Node dependencies installed with `npm install`

On this machine, Rust was installed under the user cargo bin and the stable toolchain can be used with:

```powershell
$env:RUSTUP_HOME = "F:\APPs_DEV\rustup"
$env:CARGO_HOME = "$env:USERPROFILE\.cargo"
```

The Visual Studio Build Tools installer failed with `0x80070070`, which is Windows error `ERROR_DISK_FULL`. Free space on `C:` is required even when the installer target and temp folder are moved to another drive.

## Commands

```bash
npm run desktop:dev
npm run desktop:prepare-sidecar
npm run desktop:build
```

## Packaging Strategy

Textdoc uses `/api/import/docx`, so production desktop packaging should keep a local Next server sidecar instead of converting the app to static export. The app is configured with `output: "standalone"` and `npm run desktop:prepare-sidecar` copies:

- `.next/standalone`
- `.next/static`
- `public`
- the active Node runtime

into `src-tauri/resources/next-server`.

In release builds, Tauri starts the bundled Node runtime with `server.js`, waits for the local server to accept connections, then navigates the main window to that local URL. The binary build is still blocked until MSVC and Windows SDK install successfully.

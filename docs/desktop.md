# Escribe Libre Desktop

The desktop shell uses Tauri 2 and packages the standalone Vite editor from `upgrade/`.

## Prerequisites

- Rust toolchain with `cargo` and `rustc`.
- Visual Studio Build Tools with MSVC and a Windows SDK.
- Node dependencies installed with `npm install` at the repository root and in `upgrade/`

On this machine, Rust was installed under the user cargo bin and the stable toolchain can be used with:

```powershell
$env:RUSTUP_HOME = "F:\APPs_DEV\rustup"
$env:CARGO_HOME = "$env:USERPROFILE\.cargo"
```

The Visual Studio Build Tools installer failed with `0x80070070`, which is Windows error `ERROR_DISK_FULL`. Free space on `C:` is required even when the installer target and temp folder are moved to another drive.

## Commands

```bash
npm run desktop:dev
npm run desktop:build
```

## Packaging Strategy

The desktop release is self-contained: Tauri bundles the compiled `upgrade/dist` frontend and embeds the existing icon assets in the executable and Windows installers. Runtime document content is kept in browser storage owned by the installed application profile, not in the installation directory.

The installer build is currently blocked on this machine until the Rust toolchain, MSVC compiler, and Windows SDK are available on `PATH`. The JavaScript production build can still be verified independently with `npm --prefix upgrade run build`.

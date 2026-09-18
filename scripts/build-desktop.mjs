// Builds the Next.js app as a static export for the Tauri desktop shell.
// Kept as a script so the env var works the same on Windows and POSIX.
import { spawnSync } from "node:child_process";

const result = spawnSync("npx", ["next", "build"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, DESKTOP_BUILD: "1" },
});

process.exit(result.status ?? 1);

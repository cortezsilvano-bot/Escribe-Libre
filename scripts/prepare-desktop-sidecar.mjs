import { chmod, cp, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const standaloneDir = path.join(root, ".next", "standalone");
const staticDir = path.join(root, ".next", "static");
const publicDir = path.join(root, "public");
const resourceDir = path.join(root, "src-tauri", "resources", "next-server");
const nodeRuntimeName = process.platform === "win32" ? "node.exe" : "node";
const nodeRuntimeTarget = path.join(resourceDir, nodeRuntimeName);

if (!existsSync(standaloneDir)) {
  throw new Error("Missing .next/standalone. Run `npm run build` before preparing the desktop sidecar.");
}

await rm(resourceDir, { recursive: true, force: true });
await mkdir(resourceDir, { recursive: true });
await cp(standaloneDir, resourceDir, { dereference: true, recursive: true });

const nextStaticTarget = path.join(resourceDir, ".next", "static");
await mkdir(path.dirname(nextStaticTarget), { recursive: true });
await cp(staticDir, nextStaticTarget, { dereference: true, recursive: true });

if (existsSync(publicDir)) {
  await cp(publicDir, path.join(resourceDir, "public"), { dereference: true, recursive: true });
}

await cp(process.execPath, nodeRuntimeTarget, { dereference: true });
if (process.platform !== "win32") {
  await chmod(nodeRuntimeTarget, 0o755);
}

console.log(`Prepared desktop sidecar bundle at ${resourceDir}`);

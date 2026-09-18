import { ok } from "@/lib/api/response";

export async function GET() {
  const mode = process.env.APP_DATA_MODE ?? "mock";

  return ok({
    status: "ready",
    mode,
    dependencies: {
      // The editor stores documents in IndexedDB, so the app is usable with no
      // backing services at all.
      localStorage: { ready: true, required: true },
      docxImport: { ready: true, required: true },
      supabase: {
        ready: mode === "mock" || Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
        required: mode === "supabase",
        optionalFallback: "local-only documents",
      },
    },
  });
}

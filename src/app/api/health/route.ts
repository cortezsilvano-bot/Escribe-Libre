import { ok } from "@/lib/api/response";

export async function GET() {
  return ok({
    status: "healthy",
    service: "escribe-libre-web",
    time: new Date().toISOString(),
    mode: process.env.APP_DATA_MODE ?? "mock",
  });
}

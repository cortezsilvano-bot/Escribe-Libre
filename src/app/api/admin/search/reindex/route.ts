import { ok } from "@/lib/api/response";
export async function POST(request: Request) { return ok({ jobId: crypto.randomUUID(), status: "queued", scope: new URL(request.url).searchParams.get("scope") ?? "incremental", idempotent: true }); }

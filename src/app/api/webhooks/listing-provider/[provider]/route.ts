import { ok, problem } from "@/lib/api/response";
export async function POST(request: Request, { params }: { params: Promise<{ provider: string }> }) { if (!request.headers.get("x-webhook-id")) return problem(400, "MISSING_EVENT_ID", "x-webhook-id is required for replay protection."); return ok({ provider: (await params).provider, accepted: true, status: "queued", payloadStored: false }); }

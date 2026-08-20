import { z } from "zod";
import { ok, parseJson } from "@/lib/api/response";
export const reasonSchema = z.object({ reason: z.string().trim().min(10).max(2_000) });
export async function moderationDecision(request: Request, id: string, action: string) { const parsed = await parseJson(request, reasonSchema); if ("response" in parsed) return parsed.response; return ok({ id, action, reason: parsed.data.reason, auditEventId: crypto.randomUUID(), decidedAt: new Date().toISOString() }); }

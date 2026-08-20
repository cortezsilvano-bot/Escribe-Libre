import { z } from "zod";
import { ok, parseJson } from "@/lib/api/response";
const schema = z.object({ status: z.enum(["new", "contacted", "tour_requested", "closed", "spam"]) });
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) { const parsed = await parseJson(request, schema); if ("response" in parsed) return parsed.response; return ok({ id: (await params).id, status: parsed.data.status, updatedAt: new Date().toISOString() }); }

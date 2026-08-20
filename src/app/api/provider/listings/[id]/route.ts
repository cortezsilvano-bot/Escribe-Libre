import { z } from "zod";
import { ok, parseJson } from "@/lib/api/response";
const schema = z.object({ title: z.string().min(8).max(160).optional(), advertisedRentCents: z.number().int().min(0).optional(), description: z.string().min(40).max(10_000).optional() });
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) { const parsed = await parseJson(request, schema); if ("response" in parsed) return parsed.response; return ok({ id: (await params).id, ...parsed.data, updatedAt: new Date().toISOString() }); }

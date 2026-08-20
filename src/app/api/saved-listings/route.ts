import { z } from "zod";
import { ok, parseJson } from "@/lib/api/response";
const schema = z.object({ listingId: z.string().uuid(), note: z.string().max(500).optional() });
export async function POST(request: Request) { const parsed = await parseJson(request, schema); if ("response" in parsed) return parsed.response; return ok({ ...parsed.data, savedAt: new Date().toISOString(), mode: "mock" }, { status: 201 }); }

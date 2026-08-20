import { z } from "zod";
import { demoIdempotency, ok, parseJson } from "@/lib/api/response";
const schema = z.object({ listingId: z.string().uuid(), preferredStart: z.string().datetime(), preferredEnd: z.string().datetime(), timeZone: z.string().min(3), tourType: z.enum(["in_person", "video"]), message: z.string().max(2_000).optional() });
export async function POST(request: Request) { const parsed = await parseJson(request, schema); if ("response" in parsed) return parsed.response; return ok({ id: crypto.randomUUID(), listingId: parsed.data.listingId, status: "requested", idempotencyKey: demoIdempotency(request) }, { status: 201 }); }

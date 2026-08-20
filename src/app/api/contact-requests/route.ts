import { z } from "zod";
import { demoIdempotency, ok, parseJson } from "@/lib/api/response";
const schema = z.object({ listingId: z.string().uuid(), name: z.string().min(2).max(100), email: z.string().email(), phone: z.string().max(30).optional(), message: z.string().min(10).max(2_000), consent: z.literal(true) });
export async function POST(request: Request) { const parsed = await parseJson(request, schema); if ("response" in parsed) return parsed.response; return ok({ id: crypto.randomUUID(), listingId: parsed.data.listingId, status: "new", idempotencyKey: demoIdempotency(request), emailPreview: true }, { status: 201 }); }

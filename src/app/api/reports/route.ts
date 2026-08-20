import { z } from "zod";
import { demoIdempotency, ok, parseJson } from "@/lib/api/response";
const schema = z.object({ listingId: z.string().uuid(), reason: z.enum(["payment_request", "identity_concern", "price_mismatch", "not_available", "discriminatory_content", "other"]), details: z.string().trim().min(10).max(2_000), contactEmail: z.string().email().optional() });
export async function POST(request: Request) { const parsed = await parseJson(request, schema); if ("response" in parsed) return parsed.response; return ok({ reportId: crypto.randomUUID(), status: "received", idempotencyKey: demoIdempotency(request), nextStep: "moderator_review" }, { status: 201 }); }

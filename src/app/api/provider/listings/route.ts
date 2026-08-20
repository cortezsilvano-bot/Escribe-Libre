import { z } from "zod";
import { ok, parseJson } from "@/lib/api/response";
const schema = z.object({ title: z.string().min(8).max(160), propertyType: z.enum(["apartment", "house", "townhouse", "condo", "room"]), advertisedRentCents: z.number().int().min(0), description: z.string().min(40).max(10_000), authorityAttested: z.literal(true) });
export async function POST(request: Request) { const parsed = await parseJson(request, schema); if ("response" in parsed) return parsed.response; return ok({ id: crypto.randomUUID(), ...parsed.data, status: "draft", verified: false, createdAt: new Date().toISOString() }, { status: 201 }); }

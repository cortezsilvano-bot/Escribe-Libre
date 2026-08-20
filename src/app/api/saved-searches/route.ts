import { z } from "zod";
import { ok, parseJson } from "@/lib/api/response";
const schema = z.object({ title: z.string().min(3).max(120), criteria: z.record(z.string(), z.unknown()), frequency: z.enum(["instant", "daily", "weekly"]), emailEnabled: z.boolean() });
export async function POST(request: Request) { const parsed = await parseJson(request, schema); if ("response" in parsed) return parsed.response; return ok({ id: crypto.randomUUID(), ...parsed.data, createdAt: new Date().toISOString() }, { status: 201 }); }

import { z } from "zod";
import { ok, parseJson } from "@/lib/api/response";
const patchSchema = z.object({ title: z.string().min(3).max(120).optional(), frequency: z.enum(["instant", "daily", "weekly"]).optional(), emailEnabled: z.boolean().optional() });
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) { const parsed = await parseJson(request, patchSchema); if ("response" in parsed) return parsed.response; return ok({ id: (await params).id, ...parsed.data, updatedAt: new Date().toISOString() }); }
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) { return ok({ id: (await params).id, removed: true }); }

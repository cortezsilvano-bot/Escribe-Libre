import { ok } from "@/lib/api/response";
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) { return ok({ id: (await params).id, status: "needs_review", renewalRequestedAt: new Date().toISOString() }); }

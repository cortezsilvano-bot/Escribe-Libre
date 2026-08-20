import { ok } from "@/lib/api/response";
export async function DELETE(_request: Request, { params }: { params: Promise<{ listingId: string }> }) { return ok({ listingId: (await params).listingId, removed: true, mode: "mock" }); }

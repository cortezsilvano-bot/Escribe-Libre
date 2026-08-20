import { ok } from "@/lib/api/response";
export async function GET() { return ok({ items: [{ id: "demo-case-1", type: "listing_review", priority: "normal", status: "open", signals: ["new direct provider", "fee completeness 92%"] }] }); }

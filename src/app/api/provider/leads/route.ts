import { ok } from "@/lib/api/response";
export async function GET() { return ok({ items: [{ id: "demo-lead", listingTitle: "Live Oak Apartment 01", renterDisplayName: "Jordan R.", status: "new", createdAt: "2026-07-15T14:30:00Z" }] }); }

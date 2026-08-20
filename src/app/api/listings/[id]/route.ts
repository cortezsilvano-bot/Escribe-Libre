import { getListingById } from "@/data/houston-listings";
import { ok, problem } from "@/lib/api/response";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) { const listing = getListingById((await params).id); return listing ? ok(listing) : problem(404, "LISTING_NOT_FOUND", "No public, current listing was found."); }

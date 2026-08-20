import { publicHoustonListings } from "@/data/houston-listings";
import { ok } from "@/lib/api/response";
export async function GET() { return ok({ items: [...new Set(publicHoustonListings.flatMap((listing) => [...listing.amenities, ...listing.accessibility]))].sort() }); }

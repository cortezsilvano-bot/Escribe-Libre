import { z } from "zod";
import type { PropertyType, RentalListing } from "@/domain/listing";
import { calculateTotalCost } from "@/lib/total-cost/calculate";
import { verificationLabel } from "@/lib/trust-safety/listing-trust";

export const searchStateSchema = z.object({
  q: z.string().trim().max(120).default(""),
  neighborhood: z.string().trim().max(80).default(""),
  minRent: z.coerce.number().int().min(0).max(50_000).optional(),
  maxRent: z.coerce.number().int().min(0).max(50_000).optional(),
  minBeds: z.coerce.number().min(0).max(20).optional(),
  type: z.enum(["apartment", "house", "townhouse", "condo", "room"]).optional(),
  pets: z.enum(["any", "cats", "dogs"]).optional(),
  furnished: z.coerce.boolean().optional(),
  accessible: z.coerce.boolean().optional(),
  verified: z.coerce.boolean().optional(),
  noApplicationFee: z.coerce.boolean().optional(),
  sort: z.enum(["recommended", "newest", "verified", "rent_asc", "rent_desc", "total_asc", "move_in"]).default("recommended"),
  page: z.coerce.number().int().min(1).default(1),
});

export type SearchState = z.infer<typeof searchStateSchema>;

export function parseSearchParams(params: URLSearchParams | Record<string, string | string[] | undefined>): SearchState {
  const raw = params instanceof URLSearchParams ? Object.fromEntries(params) : params;
  const normalized = Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]).filter(([, value]) => value !== undefined && value !== ""));
  return searchStateSchema.parse(normalized);
}

export function serializeSearchState(state: Partial<SearchState>) {
  const params = new URLSearchParams();
  Object.entries(state).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== false && value !== "recommended" && value !== 1) params.set(key, String(value));
  });
  return params.toString();
}

export function filterListings(listings: RentalListing[], state: SearchState) {
  const query = state.q.toLowerCase();
  const organic = listings.filter((listing) => {
    const cost = calculateTotalCost({ baseRentCents: listing.advertisedRentCents, leaseMonths: listing.leaseMonths, charges: listing.charges, concessions: listing.concessions });
    const text = [listing.title, listing.neighborhood, listing.city, listing.propertyType, listing.description, ...listing.amenities].join(" ").toLowerCase();
    return listing.status === "published"
      && (!query || text.includes(query) || query.split(/\s+/).some((word) => word.length > 2 && text.includes(word)))
      && (!state.neighborhood || listing.neighborhood.toLowerCase() === state.neighborhood.toLowerCase())
      && (state.minRent === undefined || listing.advertisedRentCents >= state.minRent * 100)
      && (state.maxRent === undefined || listing.advertisedRentCents <= state.maxRent * 100)
      && (state.minBeds === undefined || listing.bedrooms >= state.minBeds)
      && (!state.type || listing.propertyType === state.type as PropertyType)
      && (!state.furnished || listing.furnished)
      && (!state.accessible || listing.accessibility.length > 0)
      && (!state.verified || Boolean(verificationLabel(listing)))
      && (!state.pets || state.pets === "any" || (state.pets === "cats" ? ["cats", "cats_and_dogs"].includes(listing.petPolicy) : ["dogs", "cats_and_dogs"].includes(listing.petPolicy)))
      && (!state.noApplicationFee || !listing.charges.some((fee) => fee.category === "application" && fee.required))
      && cost.estimatedTotalMonthlyCents >= 0;
  });
  return organic.sort((a, b) => {
    if (state.sort === "newest") return +new Date(b.updatedAt) - +new Date(a.updatedAt);
    if (state.sort === "verified") return Number(Boolean(verificationLabel(b))) - Number(Boolean(verificationLabel(a)));
    if (state.sort === "rent_asc") return a.advertisedRentCents - b.advertisedRentCents;
    if (state.sort === "rent_desc") return b.advertisedRentCents - a.advertisedRentCents;
    if (state.sort === "total_asc") return calculateTotalCost({ baseRentCents: a.advertisedRentCents, leaseMonths: a.leaseMonths, charges: a.charges, concessions: a.concessions }).estimatedTotalMonthlyCents - calculateTotalCost({ baseRentCents: b.advertisedRentCents, leaseMonths: b.leaseMonths, charges: b.charges, concessions: b.concessions }).estimatedTotalMonthlyCents;
    if (state.sort === "move_in") return +new Date(a.availableOn) - +new Date(b.availableOn);
    return Number(Boolean(verificationLabel(b))) - Number(Boolean(verificationLabel(a))) || +new Date(b.updatedAt) - +new Date(a.updatedAt);
  });
}

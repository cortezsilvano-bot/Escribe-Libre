import type { Concession, ListingCharge, PropertyType, RentalListing, VerificationRecord } from "@/domain/listing";

const neighborhoods = [
  ["Downtown", "77002", 29.7604, -95.3698],
  ["Midtown", "77004", 29.7419, -95.3761],
  ["Montrose", "77006", 29.7427, -95.3908],
  ["The Heights", "77008", 29.7988, -95.3984],
  ["EaDo", "77003", 29.7487, -95.3546],
  ["Texas Medical Center", "77030", 29.7079, -95.3976],
  ["West University", "77005", 29.7180, -95.4338],
  ["Spring Branch", "77055", 29.7998, -95.5140],
  ["Katy", "77449", 29.7858, -95.8245],
  ["Cypress", "77429", 29.9691, -95.6972],
  ["Sugar Land", "77479", 29.6197, -95.6349],
  ["Pearland", "77584", 29.5636, -95.2860],
] as const;

const propertyTypes: PropertyType[] = ["apartment", "house", "townhouse", "condo", "room"];
const amenities = ["Washer/dryer", "Air conditioning", "Pool", "Gym", "Balcony/patio", "Yard", "EV charging", "Gated access", "High-speed internet", "Garage"];
const names = ["Live Oak", "Bayou", "Magnolia", "Skyline", "Juniper", "Briar", "Cypress", "Terrace", "Lantern", "Post Oak"];

function charge(id: string, name: string, category: ListingCharge["category"], cents: number, cadence: ListingCharge["cadence"], required = true, refundable = false, source: ListingCharge["source"] = "provider_reported"): ListingCharge {
  return { id, name, category, amount: { type: source === "platform_estimated" ? "estimated" : "fixed", cents }, cadence, required, refundable, source };
}

function listingAt(index: number): RentalListing {
  const [neighborhood, zip, baseLat, baseLng] = neighborhoods[index % neighborhoods.length];
  const propertyType = propertyTypes[index % propertyTypes.length];
  const bedrooms = propertyType === "room" ? 1 : index % 4;
  const baseRent = 82_500 + (index % 17) * 9_500 + bedrooms * 29_000 + (propertyType === "house" ? 46_000 : 0);
  const verified = index % 5 !== 0;
  const todayOffset = index % 27;
  const charges: ListingCharge[] = [
    charge(`${index}-utility`, "Estimated utilities", "utility", 7_500 + (index % 4) * 1_250, "monthly", true, false, "platform_estimated"),
    charge(`${index}-admin`, "Resident services", "administrative", 2_500 + (index % 3) * 500, "monthly"),
    charge(`${index}-deposit`, "Security deposit", "deposit", 50_000 + (index % 4) * 15_000, "one_time", true, true),
  ];
  if (index % 3 !== 0) charges.push(charge(`${index}-app`, "Application fee", "application", 5_000 + (index % 3) * 1_000, "one_time"));
  if (index % 2 === 0) charges.push(charge(`${index}-pet`, "Pet rent", "pet", 3_000, "monthly", false));
  if (index % 4 === 0) charges.push(charge(`${index}-parking`, "Reserved parking", "parking", 6_500, "monthly", false));
  const concessions: Concession[] = index % 7 === 0 ? [{ id: `${index}-special`, kind: "free_weeks", value: 2, eligibleLeaseMonths: [13], appliedAt: "first_month" }] : [];
  const verificationRecords: VerificationRecord[] = verified ? [{
    id: `${index}-verification`, subject: "listing", level: index % 3 === 0 ? "authority" : "address", status: "active",
    verifiedAt: `2026-06-${String(1 + index % 25).padStart(2, "0")}T12:00:00Z`, expiresAt: "2026-12-31T23:59:59Z", method: index % 3 === 0 ? "manual authority review" : "address evidence review",
  }] : [];
  const title = `${names[index % names.length]} ${propertyType === "room" ? "Room" : propertyType[0].toUpperCase() + propertyType.slice(1)} ${String(index + 1).padStart(2, "0")}`;
  return {
    id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
    slug: `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${neighborhood.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    title,
    description: `A clearly synthetic ${propertyType} fixture in ${neighborhood}, created for development and testing. Pricing, availability, policies, and imagery are not real offers.`,
    status: index % 19 === 0 ? "expired" : index % 23 === 0 ? "needs_review" : "published",
    propertyType, neighborhood, city: neighborhood === "Katy" || neighborhood === "Cypress" || neighborhood === "Sugar Land" || neighborhood === "Pearland" ? neighborhood : "Houston", state: "TX", zip,
    addressDisplay: index % 6 === 0 ? `Near ${neighborhood}, ${zip}` : `${1200 + index * 7} Example ${index % 2 ? "Street" : "Avenue"}, ${neighborhood}`,
    latitude: baseLat + ((index % 7) - 3) * 0.0032,
    longitude: baseLng + ((index % 5) - 2) * 0.0038,
    bedrooms, bathrooms: Math.max(1, bedrooms - (index % 2) * 0.5), squareFeet: 480 + bedrooms * 285 + (index % 5) * 45,
    advertisedRentCents: baseRent, leaseMonths: index % 7 === 0 ? 13 : 12,
    availableOn: `2026-${String(8 + index % 4).padStart(2, "0")}-${String(1 + index % 25).padStart(2, "0")}`,
    furnished: index % 6 === 0, petPolicy: index % 5 === 0 ? "none" : index % 3 === 0 ? "cats" : "cats_and_dogs",
    amenities: amenities.filter((_, amenityIndex) => (index + amenityIndex) % 3 !== 0).slice(0, 6),
    accessibility: index % 8 === 0 ? ["Step-free entrance", "Accessible parking", "Wide doorways"] : [],
    utilitiesIncluded: index % 4 === 0 ? ["Water", "Trash"] : [], parking: index % 4 === 0 ? "Reserved covered parking available" : "Provider-reported parking varies",
    charges, concessions, verificationRecords,
    source: { name: index % 4 === 0 ? "Direct provider submission" : "Synthetic fixture adapter", type: index % 4 === 0 ? "direct" : "fixture", synchronizedAt: `2026-07-${String(1 + todayOffset).padStart(2, "0")}T15:00:00Z` },
    updatedAt: `2026-07-${String(1 + todayOffset).padStart(2, "0")}T15:00:00Z`, expiresAt: "2026-09-30T23:59:59Z",
    image: `/images/rental-${index % 4 + 1}.svg`, sponsored: index === 3 || index === 31,
    provider: { name: index % 4 === 0 ? "Sample Small Landlord" : `${names[(index + 3) % names.length]} Property Group`, responseTime: index % 3 === 0 ? "Usually responds within 2 hours" : "Usually responds within 1 day", listingCount: 1 + index % 18 },
    providerReportedVoucherAcceptance: index % 9 === 0, synthetic: true,
  };
}

export const houstonListings = Array.from({ length: 108 }, (_, index) => listingAt(index));
export const publicHoustonListings = houstonListings.filter((listing) => listing.status === "published");

export function getListingBySlug(slug: string) {
  return publicHoustonListings.find((listing) => listing.slug === slug);
}

export function getListingById(id: string) {
  return publicHoustonListings.find((listing) => listing.id === id);
}

export const houstonNeighborhoods = neighborhoods.map(([name]) => name);

export type PropertyType = "apartment" | "house" | "townhouse" | "condo" | "room";
export type VerificationLevel = "email" | "phone" | "address" | "authority" | "business";
export type ListingStatus = "draft" | "submitted" | "needs_review" | "approved" | "published" | "rejected" | "suspended" | "expired" | "rented" | "archived";
export type ChargeCadence = "monthly" | "one_time" | "annual" | "usage_based";
export type ChargeAmount =
  | { type: "fixed" | "estimated"; cents: number }
  | { type: "range"; minimumCents: number; maximumCents: number }
  | { type: "percentage"; basisPoints: number };

export interface ListingCharge {
  id: string;
  name: string;
  category: "rent" | "utility" | "administrative" | "application" | "deposit" | "pet" | "parking" | "other";
  amount: ChargeAmount;
  cadence: ChargeCadence;
  required: boolean;
  refundable: boolean;
  source: "provider_reported" | "platform_estimated";
  taxable?: boolean;
  petSpecific?: boolean;
  parkingSpecific?: boolean;
  effectiveStart?: string;
  effectiveEnd?: string;
  notes?: string;
}

export interface Concession {
  id: string;
  kind: "free_days" | "free_weeks" | "free_months" | "fixed_credit" | "percentage" | "move_in_credit";
  value: number;
  eligibleLeaseMonths?: number[];
  appliedAt: "first_month" | "last_month" | "prorated" | "move_in";
}

export interface VerificationRecord {
  id: string;
  subject: "listing" | "provider" | "property";
  level: VerificationLevel;
  status: "active" | "expired" | "revoked" | "pending";
  verifiedAt: string;
  expiresAt?: string;
  method: string;
}

export interface RentalListing {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: ListingStatus;
  propertyType: PropertyType;
  neighborhood: string;
  city: string;
  state: "TX";
  zip: string;
  addressDisplay: string;
  latitude: number;
  longitude: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet?: number;
  advertisedRentCents: number;
  leaseMonths: number;
  availableOn: string;
  furnished: boolean;
  petPolicy: "none" | "cats" | "dogs" | "cats_and_dogs";
  amenities: string[];
  accessibility: string[];
  utilitiesIncluded: string[];
  parking: string;
  charges: ListingCharge[];
  concessions: Concession[];
  verificationRecords: VerificationRecord[];
  source: { name: string; type: "direct" | "licensed_api" | "csv" | "fixture"; synchronizedAt: string };
  updatedAt: string;
  expiresAt: string;
  image: string;
  sponsored?: boolean;
  provider: { name: string; responseTime: string; listingCount: number };
  providerReportedVoucherAcceptance?: boolean;
  synthetic: true;
}

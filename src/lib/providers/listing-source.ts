import type { RentalListing } from "@/domain/listing";
import { houstonListings } from "@/data/houston-listings";

export interface SourceHealth { healthy: boolean; provider: string; message: string; checkedAt: string }
export interface RawSourceListing { externalId: string; payload: unknown; updatedAt: string }

export interface ListingSourceAdapter {
  readonly name: string;
  testConnection(): Promise<SourceHealth>;
  fetchListings(cursor?: string): Promise<{ items: RawSourceListing[]; nextCursor?: string }>;
  fetchListingByExternalId(externalId: string): Promise<RawSourceListing | null>;
  fetchChangesSince(isoDate: string): Promise<RawSourceListing[]>;
  normalizeListing(raw: RawSourceListing): Promise<RentalListing>;
  acknowledgeSync(externalId: string, canonicalId: string): Promise<void>;
  healthCheck(): Promise<SourceHealth>;
}

export class JsonFixtureAdapter implements ListingSourceAdapter {
  readonly name: string = "json-fixture";
  async testConnection() { return this.healthCheck(); }
  async fetchListings() { return { items: houstonListings.map((listing) => ({ externalId: listing.id, payload: listing, updatedAt: listing.updatedAt })) }; }
  async fetchListingByExternalId(externalId: string) { return (await this.fetchListings()).items.find((item) => item.externalId === externalId) ?? null; }
  async fetchChangesSince(isoDate: string) { return (await this.fetchListings()).items.filter((item) => item.updatedAt > isoDate); }
  async normalizeListing(raw: RawSourceListing) { return raw.payload as RentalListing; }
  async acknowledgeSync() { return; }
  async healthCheck(): Promise<SourceHealth> { return { healthy: true, provider: this.name, message: "108 synthetic Houston fixtures available", checkedAt: new Date().toISOString() }; }
}

export class DirectSubmissionAdapter extends JsonFixtureAdapter { readonly name = "direct-submission"; }
export class CsvImportAdapter extends JsonFixtureAdapter { readonly name = "csv-import"; }
export class RentCastAdapter extends JsonFixtureAdapter {
  readonly name = "rentcast-licensed-api";
  override async healthCheck(): Promise<SourceHealth> { const enabled = process.env.ENABLE_RENTCAST === "true" && Boolean(process.env.RENTCAST_API_KEY); return { healthy: enabled, provider: this.name, message: enabled ? "Configured" : "Disabled; no network request made", checkedAt: new Date().toISOString() }; }
}

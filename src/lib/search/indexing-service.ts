import type { RentalListing } from "@/domain/listing";
export interface IndexResult { id: string; operation: "upsert" | "delete"; status: "completed" | "failed"; error?: string }
export interface ListingIndex { upsert(listing: RentalListing): Promise<IndexResult>; remove(id: string): Promise<IndexResult>; health(): Promise<{ healthy: boolean; indexedDocuments: number; lagSeconds: number }> }
export class InMemoryListingIndex implements ListingIndex {
  private readonly records = new Map<string, RentalListing>();
  async upsert(listing: RentalListing) { this.records.set(listing.id, listing); return { id: listing.id, operation: "upsert", status: "completed" } as const; }
  async remove(id: string) { this.records.delete(id); return { id, operation: "delete", status: "completed" } as const; }
  async health() { return { healthy: true, indexedDocuments: this.records.size, lagSeconds: 0 }; }
}
export async function fullReindex(index: ListingIndex, listings: RentalListing[]) { const results: IndexResult[] = []; for (const listing of listings) results.push(await index.upsert(listing)); return { processed: results.length, failed: results.filter((result) => result.status === "failed").length, results }; }

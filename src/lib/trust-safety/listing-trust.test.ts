import { describe, expect, it } from "vitest";
import { publicHoustonListings } from "@/data/houston-listings";
import { scanListingContent, verificationLabel } from "./listing-trust";

describe("listing trust", () => {
  it("does not invent verification", () => {
    const listing = publicHoustonListings.find((item) => item.verificationRecords.length === 0)!;
    expect(verificationLabel(listing)).toBeNull();
  });

  it("flags discriminatory phrases for moderation", () => {
    expect(scanListingContent("Quiet building. No children allowed.")).toHaveLength(1);
    expect(scanListingContent("Two bedrooms with a balcony.")).toHaveLength(0);
  });
});

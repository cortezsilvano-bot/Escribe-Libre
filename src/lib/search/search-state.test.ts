import { describe, expect, it } from "vitest";
import { filterListings, parseSearchParams, serializeSearchState } from "./search-state";
import { publicHoustonListings } from "@/data/houston-listings";

describe("search state", () => {
  it("round trips shareable filters", () => {
    const state = parseSearchParams(new URLSearchParams("q=townhouse&maxRent=2500&minBeds=2&verified=true&sort=total_asc"));
    expect(parseSearchParams(new URLSearchParams(serializeSearchState(state)))).toEqual(state);
  });

  it("filters verified inventory by real verification records", () => {
    const results = filterListings(publicHoustonListings, parseSearchParams(new URLSearchParams("verified=true&type=house")));
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((listing) => listing.verificationRecords.some((record) => record.status === "active"))).toBe(true);
  });
});

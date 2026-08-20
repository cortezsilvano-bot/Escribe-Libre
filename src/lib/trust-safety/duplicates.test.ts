import { describe, expect, it } from "vitest";
import { normalizeAddress, scoreDuplicate } from "./duplicates";

describe("duplicate candidates", () => {
  it("normalizes common address variants", () => { expect(normalizeAddress("123 Main Street, #4")).toBe("123 MAIN ST 4"); });
  it("explains a likely duplicate without merging it", () => {
    const base = { normalizedAddress: "123 MAIN ST", unit: "4", latitude: 29.75, longitude: -95.37, bedrooms: 2, bathrooms: 2, squareFeet: 1000, priceCents: 180_000, providerId: "p", imageHashes: ["hash"] };
    const result = scoreDuplicate(base, { ...base, priceCents: 181_000 });
    expect(result.score).toBeGreaterThanOrEqual(.85);
    expect(result.recommendation).toBe("review_likely_duplicate");
    expect(result.reasons).toContain("normalized address matches");
  });
});

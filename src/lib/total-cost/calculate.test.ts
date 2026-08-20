import { describe, expect, it } from "vitest";
import type { ListingCharge } from "@/domain/listing";
import { calculateTotalCost } from "./calculate";

const fixed = (overrides: Partial<ListingCharge> = {}): ListingCharge => ({
  id: "fee", name: "Fee", category: "administrative", amount: { type: "fixed", cents: 5_000 }, cadence: "monthly", required: true, refundable: false, source: "provider_reported", ...overrides,
});

describe("calculateTotalCost", () => {
  it("returns rent alone when there are no fees", () => {
    expect(calculateTotalCost({ baseRentCents: 150_000, leaseMonths: 12, charges: [], concessions: [] })).toMatchObject({ effectiveRentCents: 150_000, estimatedTotalMonthlyCents: 150_000, estimatedDueAtMoveInCents: 150_000 });
  });

  it("separates required, optional, utility, refundable, and move-in charges", () => {
    const result = calculateTotalCost({ baseRentCents: 100_000, leaseMonths: 12, concessions: [], charges: [
      fixed(), fixed({ id: "optional", required: false, amount: { type: "fixed", cents: 3_000 } }),
      fixed({ id: "utility", category: "utility", source: "platform_estimated", amount: { type: "estimated", cents: 8_000 } }),
      fixed({ id: "deposit", category: "deposit", cadence: "one_time", refundable: true, amount: { type: "fixed", cents: 60_000 } }),
      fixed({ id: "application", category: "application", cadence: "one_time", amount: { type: "fixed", cents: 5_500 } }),
    ] });
    expect(result).toMatchObject({ requiredRecurringCents: 5_000, optionalRecurringCents: 3_000, estimatedUtilitiesCents: 8_000, refundableDepositsCents: 60_000, requiredMoveInCents: 5_500, estimatedTotalMonthlyCents: 113_000, estimatedDueAtMoveInCents: 165_500 });
  });

  it("amortizes one free month over a 13 month lease", () => {
    const result = calculateTotalCost({ baseRentCents: 130_000, leaseMonths: 13, charges: [], concessions: [{ id: "free", kind: "free_months", value: 1, eligibleLeaseMonths: [13], appliedAt: "last_month" }] });
    expect(result.effectiveRentCents).toBe(120_000);
    expect(result.estimatedDueAtMoveInCents).toBe(130_000);
  });

  it("supports fixed credits, percentages, ranges, and rounding", () => {
    const result = calculateTotalCost({ baseRentCents: 99_999, leaseMonths: 12, charges: [fixed({ amount: { type: "range", minimumCents: 2_000, maximumCents: 3_001 } })], concessions: [{ id: "credit", kind: "fixed_credit", value: 10_000, appliedAt: "first_month" }, { id: "percent", kind: "percentage", value: 1, appliedAt: "prorated" }] });
    expect(result.hasRangedAmounts).toBe(true);
    expect(result.requiredRecurringCents).toBe(2_501);
    expect(result.effectiveRentCents).toBe(98_166);
  });

  it("ignores date-bound charges outside the effective window", () => {
    const result = calculateTotalCost({ baseRentCents: 100_000, leaseMonths: 12, concessions: [], asOf: new Date("2026-07-15T00:00:00Z"), charges: [fixed({ effectiveEnd: "2026-06-30T23:59:59Z" })] });
    expect(result.requiredRecurringCents).toBe(0);
  });

  it("rejects negative or invalid ranged values", () => {
    expect(() => calculateTotalCost({ baseRentCents: -1, leaseMonths: 12, charges: [], concessions: [] })).toThrow(/Base rent/);
    expect(() => calculateTotalCost({ baseRentCents: 100, leaseMonths: 12, concessions: [], charges: [fixed({ amount: { type: "range", minimumCents: 300, maximumCents: 200 } })] })).toThrow(/invalid range/);
  });
});

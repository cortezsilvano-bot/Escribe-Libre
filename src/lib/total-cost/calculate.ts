import type { Concession, ListingCharge } from "@/domain/listing";

export interface CostInput {
  baseRentCents: number;
  leaseMonths: number;
  charges: ListingCharge[];
  concessions: Concession[];
  asOf?: Date;
}

export interface CostSummary {
  advertisedRentCents: number;
  effectiveRentCents: number;
  requiredRecurringCents: number;
  optionalRecurringCents: number;
  estimatedUtilitiesCents: number;
  estimatedTotalMonthlyCents: number;
  requiredMoveInCents: number;
  optionalMoveInCents: number;
  refundableDepositsCents: number;
  nonrefundableMoveInCents: number;
  estimatedDueAtMoveInCents: number;
  hasRangedAmounts: boolean;
}

const midpoint = (charge: ListingCharge, baseRentCents: number) => {
  switch (charge.amount.type) {
    case "fixed":
    case "estimated": return charge.amount.cents;
    case "range": return Math.round((charge.amount.minimumCents + charge.amount.maximumCents) / 2);
    case "percentage": return Math.round(baseRentCents * charge.amount.basisPoints / 10_000);
  }
};

const isActive = (charge: ListingCharge, asOf: Date) => {
  const timestamp = asOf.getTime();
  return (!charge.effectiveStart || new Date(charge.effectiveStart).getTime() <= timestamp)
    && (!charge.effectiveEnd || new Date(charge.effectiveEnd).getTime() >= timestamp);
};

export function calculateConcessionCents(baseRentCents: number, leaseMonths: number, concessions: Concession[]) {
  return concessions.reduce((total, concession) => {
    if (concession.eligibleLeaseMonths && !concession.eligibleLeaseMonths.includes(leaseMonths)) return total;
    switch (concession.kind) {
      case "free_days": return total + Math.round(baseRentCents * concession.value / 30);
      case "free_weeks": return total + Math.round(baseRentCents * concession.value * 7 / 30);
      case "free_months": return total + baseRentCents * concession.value;
      case "percentage": return total + Math.round(baseRentCents * leaseMonths * concession.value / 100);
      case "fixed_credit":
      case "move_in_credit": return total + Math.round(concession.value);
    }
  }, 0);
}

export function calculateTotalCost(input: CostInput): CostSummary {
  if (input.baseRentCents < 0 || !Number.isInteger(input.baseRentCents)) throw new Error("Base rent must be a nonnegative integer number of cents.");
  if (!Number.isInteger(input.leaseMonths) || input.leaseMonths <= 0) throw new Error("Lease length must be a positive integer.");
  const asOf = input.asOf ?? new Date();
  const active = input.charges.filter((charge) => {
    const values = charge.amount.type === "range" ? [charge.amount.minimumCents, charge.amount.maximumCents]
      : charge.amount.type === "percentage" ? [charge.amount.basisPoints] : [charge.amount.cents];
    if (values.some((value) => value < 0)) throw new Error(`Charge ${charge.name} cannot be negative.`);
    if (charge.amount.type === "range" && charge.amount.maximumCents < charge.amount.minimumCents) throw new Error(`Charge ${charge.name} has an invalid range.`);
    return isActive(charge, asOf);
  });
  const sum = (predicate: (charge: ListingCharge) => boolean) => active.filter(predicate).reduce((total, charge) => total + midpoint(charge, input.baseRentCents), 0);
  const requiredRecurringCents = sum((charge) => charge.required && charge.cadence === "monthly" && charge.category !== "utility");
  const optionalRecurringCents = sum((charge) => !charge.required && charge.cadence === "monthly");
  const estimatedUtilitiesCents = sum((charge) => charge.category === "utility" && charge.cadence === "monthly");
  const requiredMoveInCents = sum((charge) => charge.required && charge.cadence === "one_time" && !charge.refundable);
  const optionalMoveInCents = sum((charge) => !charge.required && charge.cadence === "one_time");
  const refundableDepositsCents = sum((charge) => charge.cadence === "one_time" && charge.refundable);
  const concessionCents = calculateConcessionCents(input.baseRentCents, input.leaseMonths, input.concessions);
  const effectiveRentCents = Math.max(0, Math.round((input.baseRentCents * input.leaseMonths - concessionCents) / input.leaseMonths));
  return {
    advertisedRentCents: input.baseRentCents,
    effectiveRentCents,
    requiredRecurringCents,
    optionalRecurringCents,
    estimatedUtilitiesCents,
    estimatedTotalMonthlyCents: effectiveRentCents + requiredRecurringCents + estimatedUtilitiesCents,
    requiredMoveInCents,
    optionalMoveInCents,
    refundableDepositsCents,
    nonrefundableMoveInCents: requiredMoveInCents,
    estimatedDueAtMoveInCents: input.baseRentCents + requiredMoveInCents + refundableDepositsCents,
    hasRangedAmounts: active.some((charge) => charge.amount.type === "range"),
  };
}

export const formatMoney = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);

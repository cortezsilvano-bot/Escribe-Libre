"use client";

import Link from "next/link";
import { GitCompareArrows } from "lucide-react";
import { publicHoustonListings } from "@/data/houston-listings";
import { useStoredIds } from "@/lib/client/local-store";
import { calculateTotalCost, formatMoney } from "@/lib/total-cost/calculate";
import { freshnessLabel, verificationLabel } from "@/lib/trust-safety/listing-trust";

export function CompareListings() {
  const compared = useStoredIds("rental:compare");
  const listings = compared.ids.map((id) => publicHoustonListings.find((listing) => listing.id === id)).filter(Boolean) as typeof publicHoustonListings;
  const rows = [
    ["Advertised rent", (i: typeof listings[number]) => formatMoney(i.advertisedRentCents)],
    ["Effective rent", (i: typeof listings[number]) => formatMoney(calculateTotalCost({ baseRentCents: i.advertisedRentCents, leaseMonths: i.leaseMonths, charges: i.charges, concessions: i.concessions }).effectiveRentCents)],
    ["Estimated monthly total", (i: typeof listings[number]) => formatMoney(calculateTotalCost({ baseRentCents: i.advertisedRentCents, leaseMonths: i.leaseMonths, charges: i.charges, concessions: i.concessions }).estimatedTotalMonthlyCents)],
    ["Estimated move-in total", (i: typeof listings[number]) => formatMoney(calculateTotalCost({ baseRentCents: i.advertisedRentCents, leaseMonths: i.leaseMonths, charges: i.charges, concessions: i.concessions }).estimatedDueAtMoveInCents)],
    ["Beds / baths / size", (i: typeof listings[number]) => `${i.bedrooms || "Studio"} / ${i.bathrooms} / ${i.squareFeet?.toLocaleString()} sq ft`],
    ["Lease", (i: typeof listings[number]) => `${i.leaseMonths} months`],
    ["Pets", (i: typeof listings[number]) => i.petPolicy.replaceAll("_", " ")],
    ["Parking", (i: typeof listings[number]) => i.parking],
    ["Verification", (i: typeof listings[number]) => verificationLabel(i) ?? "No active record"],
    ["Freshness", (i: typeof listings[number]) => freshnessLabel(i.updatedAt, new Date("2026-07-15T12:00:00Z"))],
  ] as const;
  return <main className="dashboard-page"><div className="container"><header className="dashboard-hero"><div><p className="kicker">Renter workspace</p><h1>Compare total value, not just rent</h1><p>Compare up to four rentals. Optional charges are not included in monthly totals.</p></div><Link href="/search" className="button button-coral">Add rentals</Link></header>{listings.length ? <div className="compare-scroll"><div className="compare-table" style={{ "--compare-count": listings.length } as React.CSSProperties}><div className="compare-cell label">Rental</div>{listings.map((listing) => <div className="compare-cell" key={listing.id}><Link href={`/listing/${listing.slug}`}><strong>{listing.title}</strong><br/><small>{listing.neighborhood}</small></Link><br/><button type="button" className="compare-button" onClick={() => compared.toggle(listing.id, 4)}>Remove</button></div>)}{rows.flatMap(([label, read]) => [<div className="compare-cell label" key={`${label}-label`}>{label}</div>, ...listings.map((listing) => <div className="compare-cell" key={`${label}-${listing.id}`}>{read(listing)}</div>)])}</div></div> : <div className="empty-state"><GitCompareArrows size={38} /><h2>Your comparison is empty</h2><p>Select Compare on up to four listing cards.</p><Link href="/search" className="button button-ink">Browse rentals</Link></div>}</div></main>;
}

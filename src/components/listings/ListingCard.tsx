"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck, CalendarDays, GitCompareArrows, Heart, PawPrint, Ruler } from "lucide-react";
import type { RentalListing } from "@/domain/listing";
import { calculateTotalCost, formatMoney } from "@/lib/total-cost/calculate";
import { freshnessLabel, verificationLabel } from "@/lib/trust-safety/listing-trust";
import { useStoredIds } from "@/lib/client/local-store";

export function ListingCard({ listing, compact = false, preload = false, onFocus }: { listing: RentalListing; compact?: boolean; preload?: boolean; onFocus?: (id: string | null) => void }) {
  const saved = useStoredIds("rental:saved");
  const compared = useStoredIds("rental:compare");
  const cost = calculateTotalCost({ baseRentCents: listing.advertisedRentCents, leaseMonths: listing.leaseMonths, charges: listing.charges, concessions: listing.concessions });
  const verified = verificationLabel(listing);
  return <article className={`listing-card ${compact ? "listing-card-compact" : ""}`} onMouseEnter={() => onFocus?.(listing.id)} onMouseLeave={() => onFocus?.(null)}>
    <div className="listing-media"><Image src={listing.image} alt={`Synthetic illustration for ${listing.title}`} fill preload={preload} loading={preload ? "eager" : "lazy"} sizes={compact ? "(max-width: 900px) 40vw, 220px" : "(max-width: 700px) 100vw, 33vw"} />{listing.synthetic && <span className="synthetic-label">Synthetic demo</span>}{listing.sponsored && <span className="sponsored-label">Sponsored</span>}<button className={saved.contains(listing.id) ? "card-action active" : "card-action"} type="button" aria-label={saved.contains(listing.id) ? `Remove ${listing.title} from saved listings` : `Save ${listing.title}`} onClick={() => saved.toggle(listing.id)}><Heart fill={saved.contains(listing.id) ? "currentColor" : "none"} /></button></div>
    <div className="listing-body">
      <div className="listing-status-row">{verified ? <span className="verification"><BadgeCheck size={15} />{verified}</span> : <span className="unverified">Verification not completed</span>}<span>{freshnessLabel(listing.updatedAt, new Date("2026-07-15T12:00:00Z"))}</span></div>
      <Link href={`/listing/${listing.slug}`} className="listing-title"><h3>{listing.title}</h3><ArrowUpRight size={18} /></Link>
      <p className="listing-location">{listing.neighborhood} · {listing.addressDisplay}</p>
      <div className="cost-pair"><div><strong>{formatMoney(listing.advertisedRentCents)}</strong><span>advertised / mo</span></div><div><strong>{formatMoney(cost.estimatedTotalMonthlyCents)}</strong><span>estimated total / mo</span></div></div>
      {cost.effectiveRentCents !== listing.advertisedRentCents && <p className="effective-rent">{formatMoney(cost.effectiveRentCents)} effective monthly on {listing.leaseMonths}-month lease</p>}
      <div className="listing-facts"><span>{listing.bedrooms === 0 ? "Studio" : `${listing.bedrooms} bd`}</span><span>{listing.bathrooms} ba</span>{listing.squareFeet && <span><Ruler size={14} /> {listing.squareFeet.toLocaleString()} sq ft</span>}<span><PawPrint size={14} /> {listing.petPolicy === "none" ? "No pets stated" : "Pets considered"}</span></div>
      <div className="listing-meta"><span><CalendarDays size={14} /> Available {new Date(`${listing.availableOn}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span><span>Source: {listing.source.name}</span></div>
      <div className="card-bottom"><span>{listing.amenities.slice(0, 2).join(" · ")}</span><button className={compared.contains(listing.id) ? "compare-button active" : "compare-button"} type="button" onClick={() => compared.toggle(listing.id, 4)}><GitCompareArrows size={15} /> {compared.contains(listing.id) ? "Comparing" : "Compare"}</button></div>
    </div>
  </article>;
}

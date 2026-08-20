"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { ListingCard } from "@/components/listings/ListingCard";
import { publicHoustonListings } from "@/data/houston-listings";
import { useStoredIds } from "@/lib/client/local-store";

export function SavedListings() {
  const saved = useStoredIds("rental:saved");
  const listings = publicHoustonListings.filter((listing) => saved.ids.includes(listing.id));
  return <main className="dashboard-page"><div className="container"><header className="dashboard-hero"><div><p className="kicker">Renter workspace</p><h1>Saved rentals</h1><p>Availability, price, and expiration changes remain visible here.</p></div><Link href="/search" className="button button-coral">Find more rentals</Link></header>{listings.length ? <div className="saved-grid">{listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}</div> : <div className="empty-state"><Heart size={38} /><h2>No saved rentals yet</h2><p>Use the heart on any listing to keep it here on this device.</p><Link href="/search" className="button button-ink">Search Houston rentals</Link></div>}</div></main>;
}

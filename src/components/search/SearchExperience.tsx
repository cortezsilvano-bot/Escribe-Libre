"use client";

import { useState } from "react";
import { Filter, List, Map, MapPin, Search } from "lucide-react";
import type { RentalListing } from "@/domain/listing";
import type { SearchState } from "@/lib/search/search-state";
import { ListingCard } from "@/components/listings/ListingCard";
import { formatMoney } from "@/lib/total-cost/calculate";

export function SearchExperience({ state, results, total }: { state: SearchState; results: RentalListing[]; total: number }) {
  const [mapView, setMapView] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  return <>
    <div className="search-topbar"><form className="container search-form-main" action="/search">
      <label className="input-shell"><Search size={18} /><span className="sr-only">Search Houston rentals</span><input name="q" defaultValue={state.q} placeholder="Search by neighborhood, landmark, or feature" /></label>
      <button className="button button-outline filter-toggle" type="button"><Filter size={17} />Filters</button>
      <button className="button button-coral" type="submit">Update search</button>
    </form></div>
    <div className={mapView ? "search-layout map-view" : "search-layout"}>
      <section className="results-panel" aria-labelledby="search-results-heading">
        <div className="results-header"><div><h1 id="search-results-heading">Houston rentals</h1><p aria-live="polite">{total} synthetic listings match · Updated from visible source records</p></div>
          <form action="/search"><input type="hidden" name="q" value={state.q} /><label><span className="sr-only">Sort results</span><select name="sort" defaultValue={state.sort} onChange={(event) => event.currentTarget.form?.requestSubmit()}><option value="recommended">Recommended</option><option value="newest">Newest</option><option value="verified">Recently verified</option><option value="rent_asc">Rent: low to high</option><option value="rent_desc">Rent: high to low</option><option value="total_asc">Estimated total: low to high</option><option value="move_in">Move-in date</option></select></label></form>
        </div>
        <form action="/search" className="filter-row">
          <input type="hidden" name="q" value={state.q} />
          <details><summary>Price</summary><div className="filter-popover"><label>Minimum advertised rent<input name="minRent" inputMode="numeric" defaultValue={state.minRent} placeholder="$900" /></label><label>Maximum advertised rent<input name="maxRent" inputMode="numeric" defaultValue={state.maxRent} placeholder="$2,500" /></label><button className="button button-ink" type="submit">Apply price</button></div></details>
          <details><summary>Bedrooms</summary><div className="filter-popover"><label>Minimum bedrooms<select name="minBeds" defaultValue={state.minBeds ?? ""}><option value="">Any</option><option value="0">Studio</option><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option></select></label><button className="button button-ink" type="submit">Apply</button></div></details>
          <details><summary>Home type</summary><div className="filter-popover"><label>Property type<select name="type" defaultValue={state.type ?? ""}><option value="">Any</option><option value="apartment">Apartment</option><option value="house">House</option><option value="townhouse">Townhouse</option><option value="condo">Condo</option><option value="room">Room</option></select></label><button className="button button-ink" type="submit">Apply</button></div></details>
          <details><summary>More filters</summary><div className="filter-popover"><label><span>Pet policy</span><select name="pets" defaultValue={state.pets ?? ""}><option value="">Any</option><option value="cats">Cats allowed</option><option value="dogs">Dogs allowed</option></select></label><label><span>Verified listings</span><select name="verified" defaultValue={state.verified ? "true" : ""}><option value="">Any</option><option value="true">Active verification only</option></select></label><label><span>Furnished</span><select name="furnished" defaultValue={state.furnished ? "true" : ""}><option value="">Any</option><option value="true">Furnished only</option></select></label><label><span>Accessibility features</span><select name="accessible" defaultValue={state.accessible ? "true" : ""}><option value="">Any</option><option value="true">Features reported</option></select></label><label><span>Application fee</span><select name="noApplicationFee" defaultValue={state.noApplicationFee ? "true" : ""}><option value="">Any</option><option value="true">No application fee</option></select></label><button className="button button-ink" type="submit">Apply filters</button></div></details>
          {(state.q || state.maxRent || state.minBeds !== undefined || state.type || state.verified) && <a className="filter-chip" href="/search">Clear all</a>}
        </form>
        {results.length ? <div className="search-list">{results.map((listing, index) => <ListingCard key={listing.id} listing={listing} compact preload={index === 0} onFocus={setFocused} />)}</div> : <div className="empty-results"><MapPin size={35} /><h2>No matching rentals in this demo set</h2><p>Try removing a filter or increasing your price range. We never fabricate a result to fill an empty search.</p><a className="button button-ink" href="/search">Reset filters</a></div>}
      </section>
      <aside className="map-panel" aria-label="Map of search results"><div className="mock-map">{results.slice(0, 22).map((listing, index) => <a key={listing.id} href={`/listing/${listing.slug}`} aria-label={`${listing.title}, ${formatMoney(listing.advertisedRentCents)}`} className={focused === listing.id ? "map-pin active" : "map-pin"} style={{ left: `${12 + (index * 31) % 78}%`, top: `${14 + (index * 23) % 72}%` }} onMouseEnter={() => setFocused(listing.id)} onMouseLeave={() => setFocused(null)}>{formatMoney(listing.advertisedRentCents)}</a>)}</div><button className="button button-light search-area-button" type="button" onClick={() => window.alert("Map-bound search is enabled in the production Mapbox adapter. This demo keeps the current synthetic Houston bounds.")}>Search this area</button><div className="map-note"><strong>Accessible map alternative:</strong> every map result is also present in the ordered listing results. Mapbox loads only when a token is configured.</div></aside>
    </div>
    <button type="button" className="button button-ink mobile-view-toggle" onClick={() => setMapView(!mapView)}>{mapView ? <List size={17} /> : <Map size={17} />}{mapView ? "Show list" : "Show map"}</button>
  </>;
}

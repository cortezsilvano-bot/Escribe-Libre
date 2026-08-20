import Link from "next/link";
import { Accessibility, ArrowRight, BadgeCheck, Building2, Calculator, House, KeyRound, ShieldCheck, Sparkles } from "lucide-react";
import { ListingCard } from "@/components/listings/ListingCard";
import { publicHoustonListings, houstonNeighborhoods } from "@/data/houston-listings";
import { appName } from "@/lib/env";

const types = [
  ["Apartments", "apartment", Building2], ["Houses", "house", House], ["Townhouses", "townhouse", KeyRound], ["Furnished", "", Sparkles],
] as const;

export default function HomePage() {
  const recent = publicHoustonListings.filter((item) => item.verificationRecords.length).slice(0, 3);
  const petFriendly = publicHoustonListings.filter((item) => item.petPolicy !== "none").slice(5, 8);
  return <main>
    <section className="hero">
      <div className="hero-orbit hero-orbit-one" />
      <div className="hero-orbit hero-orbit-two" />
      <div className="container hero-content">
        <div className="hero-copy">
          <p className="eyebrow"><BadgeCheck size={17} /> Clear costs. Visible sources. Fresh inventory.</p>
          <h1>Find a Houston rental you can feel informed about.</h1>
          <p className="hero-lede">Compare the advertised rent with recurring fees, estimated utilities, and move-in costs—before you contact a provider.</p>
          <form action="/search" className="hero-search">
            <label className="sr-only" htmlFor="home-search">Search Houston rentals</label>
            <input id="home-search" name="q" placeholder="Neighborhood, address, landmark, or rental type" />
            <button className="button button-coral" type="submit">Search Houston <ArrowRight size={18} /></button>
          </form>
          <div className="suggestions" aria-label="Suggested searches">
            <span>Try:</span>
            <Link href="/search?q=Texas+Medical+Center&minBeds=2">2 beds near the Medical Center</Link>
            <Link href="/search?type=townhouse&pets=dogs&neighborhood=Cypress">Pet-friendly in Cypress</Link>
          </div>
        </div>
        <aside className="hero-trust-card" aria-label="Marketplace trust commitments">
          <div className="trust-card-top"><ShieldCheck size={26} /><span>Built for a more careful search</span></div>
          <div className="mini-cost-card"><span>Advertised rent</span><strong>$1,650</strong></div>
          <div className="mini-cost-card"><span>Estimated monthly total</span><strong>$1,772</strong></div>
          <div className="cost-rule" />
          <p><BadgeCheck size={16} /> Verification tied to active records</p>
          <p><Calculator size={16} /> Deterministic fee breakdowns</p>
          <p><Sparkles size={16} /> Freshness and source shown separately</p>
          <small>Illustrative costs. Final terms come from the provider and lease.</small>
        </aside>
      </div>
    </section>

    <section className="container quick-section" aria-labelledby="browse-type">
      <div className="section-heading"><div><p className="kicker">Start your way</p><h2 id="browse-type">Browse by rental type</h2></div><Link href="/search" className="text-link">View all rentals <ArrowRight size={16} /></Link></div>
      <div className="type-grid">{types.map(([label, type, Icon]) => <Link className="type-card" key={label} href={label === "Furnished" ? "/search?furnished=true" : `/search?type=${type}`}><span><Icon size={24} /></span><strong>{label}</strong><small>Explore synthetic Houston inventory</small><ArrowRight size={18} /></Link>)}</div>
    </section>

    <section className="trust-band">
      <div className="container trust-grid">
        <div><p className="kicker">Why {appName()}</p><h2>Trust is a set of visible facts, not a badge alone.</h2><p>We keep verification, freshness, source, fees, and provider-reported policies distinct so you can judge a listing with context.</p><Link className="button button-ink" href="/safety">See our safety approach</Link></div>
        <div className="principle-list">
          <article><BadgeCheck /><div><h3>Verification with provenance</h3><p>Every verification label maps to an active review record and method.</p></div></article>
          <article><Calculator /><div><h3>Total-cost clarity</h3><p>See required, optional, estimated, refundable, and one-time amounts.</p></div></article>
          <article><ShieldCheck /><div><h3>Scam-aware by design</h3><p>Report suspicious listings and keep payment warnings close to contact actions.</p></div></article>
        </div>
      </div>
    </section>

    <ListingShelf title="Recently updated & verified" eyebrow="Fresh inventory" listings={recent} href="/search?verified=true&sort=newest" />
    <ListingShelf title="Pet-friendly places" eyebrow="Room for every roommate" listings={petFriendly} href="/search?pets=any" />

    <section className="container pathway-grid">
      <Link className="pathway-card pathway-access" href="/search?accessible=true"><Accessibility size={34} /><p className="kicker">Search entry</p><h2>Accessibility features, stated plainly</h2><p>Filter provider-reported step-free entrances, accessible parking, and wide doorways.</p><span>Explore accessible rentals <ArrowRight size={17} /></span></Link>
      <Link className="pathway-card pathway-furnished" href="/search?furnished=true"><Sparkles size={34} /><p className="kicker">Flexible stays</p><h2>Furnished rentals without guesswork</h2><p>See lease length, fees, and furnishing details in the same comparison.</p><span>Browse furnished rentals <ArrowRight size={17} /></span></Link>
    </section>

    <section className="neighborhood-section"><div className="container"><div className="section-heading"><div><p className="kicker">Houston launch market</p><h2>Explore neighborhoods and nearby cities</h2></div></div><div className="neighborhood-links">{houstonNeighborhoods.map((name) => <Link key={name} href={`/rentals/houston-tx/${name.toLowerCase().replace(/\s+/g, "-")}`}>{name}<ArrowRight size={15} /></Link>)}</div></div></section>

    <section className="container provider-cta"><div><p className="kicker">For housing providers</p><h2>List with complete costs and accountable provenance.</h2><p>Small landlords, managers, and leasing teams can submit inventory for moderation without paying for an integration.</p></div><Link href="/provider/onboarding" className="button button-coral">Start provider onboarding <ArrowRight size={18} /></Link></section>
    <section className="safety-callout container"><ShieldCheck /><div><strong>Keep every rental search grounded.</strong><p>Never send money before verifying the property, the person offering it, the lease, and the payment method.</p></div><Link href="/safety">Read the renter safety guide</Link></section>
  </main>;
}

function ListingShelf({ title, eyebrow, listings, href }: { title: string; eyebrow: string; listings: typeof publicHoustonListings; href: string }) {
  return <section className="container listing-shelf"><div className="section-heading"><div><p className="kicker">{eyebrow}</p><h2>{title}</h2></div><Link className="text-link" href={href}>See all <ArrowRight size={16} /></Link></div><div className="listing-grid">{listings.map((listing, index) => <ListingCard key={listing.id} listing={listing} preload={index === 0} />)}</div></section>;
}

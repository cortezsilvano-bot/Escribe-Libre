import Link from "next/link";
export default function NotFound(){ return <main className="container content-page"><p className="kicker">404</p><h1>That rental page isn’t available.</h1><p className="lead">It may have expired, been removed from public search, or never existed.</p><Link className="button button-ink" href="/search">Search active Houston rentals</Link></main>; }

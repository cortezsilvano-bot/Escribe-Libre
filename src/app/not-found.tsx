import Link from "next/link";

export default function NotFound() {
  return (
    <main className="status-page">
      <p className="eyebrow">404</p>
      <h1>That page isn&rsquo;t here.</h1>
      <p>The document may have been deleted from this browser, or the link may be wrong.</p>
      <Link className="primary-button" href="/">Back to documents</Link>
    </main>
  );
}

"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="status-page">
      <p className="eyebrow">Something went wrong</p>
      <h1>We couldn&rsquo;t load this view.</h1>
      <p>Your documents are stored in this browser and were not changed by this error.</p>
      <button className="primary-button" type="button" onClick={reset}>Try again</button>
    </main>
  );
}

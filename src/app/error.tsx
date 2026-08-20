"use client";
export default function ErrorPage({ reset }: { reset: () => void }){ return <main className="container content-page"><p className="kicker">Something went wrong</p><h1>We couldn’t load this view.</h1><p>Retry without losing your current browser search state.</p><button className="button button-ink" type="button" onClick={reset}>Try again</button></main>; }

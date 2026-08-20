import type { Metadata } from "next";
import { SearchExperience } from "@/components/search/SearchExperience";
import { publicHoustonListings } from "@/data/houston-listings";
import { filterListings, parseSearchParams } from "@/lib/search/search-state";

export const metadata: Metadata = { title: "Search Houston rentals", robots: { index: false, follow: true } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = await searchParams;
  let state;
  try { state = parseSearchParams(raw); } catch { state = parseSearchParams({}); }
  const results = filterListings(publicHoustonListings, state);
  return <main><SearchExperience state={state} results={results.slice(0, 30)} total={results.length} /></main>;
}

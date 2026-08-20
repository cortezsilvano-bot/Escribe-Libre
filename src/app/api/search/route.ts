import { publicHoustonListings } from "@/data/houston-listings";
import { ok, problem } from "@/lib/api/response";
import { filterListings, parseSearchParams } from "@/lib/search/search-state";

export async function GET(request: Request) { try { const url = new URL(request.url); const state = parseSearchParams(url.searchParams); const results = filterListings(publicHoustonListings, state); const start = (state.page - 1) * 20; return ok({ items: results.slice(start, start + 20), total: results.length, page: state.page, pageSize: 20, rankingVersion: "mvp-v1", sponsoredSlots: [] }); } catch (error) { return problem(400, "INVALID_SEARCH", "Search query parameters are invalid.", error instanceof Error ? error.message : undefined); } }

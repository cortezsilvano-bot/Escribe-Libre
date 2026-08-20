import type { MetadataRoute } from "next";
import { getPublicEnv } from "@/lib/env";
import { houstonNeighborhoods, publicHoustonListings } from "@/data/houston-listings";
export default function sitemap(): MetadataRoute.Sitemap { const base = getPublicEnv().NEXT_PUBLIC_APP_URL; return [{ url: base, changeFrequency: "daily", priority: 1 }, { url: `${base}/rentals/houston-tx`, changeFrequency: "daily", priority: .9 }, ...houstonNeighborhoods.map((name) => ({ url: `${base}/rentals/houston-tx/${name.toLowerCase().replace(/\s+/g, "-")}`, changeFrequency: "daily" as const, priority: .7 })), ...publicHoustonListings.map((listing) => ({ url: `${base}/listing/${listing.slug}`, lastModified: listing.updatedAt, changeFrequency: "weekly" as const, priority: .6 }))]; }

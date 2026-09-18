import type { MetadataRoute } from "next";
import { getPublicEnv } from "@/lib/env";

// Documents live in the visitor's browser, so the workspace entry point is the
// only publicly addressable URL.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getPublicEnv().NEXT_PUBLIC_APP_URL;
  return [{ url: base, changeFrequency: "weekly", priority: 1 }];
}

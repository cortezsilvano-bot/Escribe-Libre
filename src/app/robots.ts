import type { MetadataRoute } from "next";
import { getPublicEnv } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: ["/"], disallow: ["/editor", "/print", "/api/"] }],
    sitemap: `${getPublicEnv().NEXT_PUBLIC_APP_URL}/sitemap.xml`,
  };
}

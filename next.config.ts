import type { NextConfig } from "next";

// The desktop shell (Tauri) serves a folder of static files and has no Node
// server, so that build is a static export. The web build stays a standalone
// server so it can keep its security headers and route handlers.
const isDesktopBuild = process.env.DESKTOP_BUILD === "1";

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  // Documents can embed remote images by URL, and exports are produced as blobs.
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  output: isDesktopBuild ? "export" : "standalone",
  reactStrictMode: true,
  poweredByHeader: false,

  // Every page is .tsx; route handlers and the robots/sitemap metadata routes
  // are .ts. Narrowing the extensions drops them from the static export, which
  // cannot host them, without deleting them from the web build.
  pageExtensions: isDesktopBuild ? ["tsx"] : ["tsx", "ts"],

  ...(isDesktopBuild
    ? {
        // Emit out/editor/index.html rather than out/editor.html so the shell
        // resolves a path without an extension.
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {
        async headers() {
          return [
            {
              source: "/(.*)",
              headers: [
                { key: "Content-Security-Policy", value: contentSecurityPolicy },
                { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                { key: "X-Content-Type-Options", value: "nosniff" },
                { key: "X-Frame-Options", value: "DENY" },
                { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), payment=()" },
                { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
              ],
            },
          ];
        },
      }),
};

export default nextConfig;

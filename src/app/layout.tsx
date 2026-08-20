import type { Metadata, Viewport } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { appName, getPublicEnv } from "@/lib/env";
import "./globals.css";

const name = appName();

export const metadata: Metadata = {
  metadataBase: new URL(getPublicEnv().NEXT_PUBLIC_APP_URL),
  title: { default: `${name} | Houston rentals with clearer costs`, template: `%s | ${name}` },
  description: "Search synthetic Houston rental inventory with transparent fees, listing provenance, freshness, and verification records.",
  manifest: "/manifest.webmanifest",
  openGraph: { title: name, description: "Verified rental discovery with transparent monthly and move-in costs.", type: "website" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, colorScheme: "light dark", themeColor: "#123f3a" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <SiteHeader appName={name} />
        <div id="main-content">{children}</div>
        <SiteFooter appName={name} />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { ServiceWorkerRegistration } from "@/components/layout/ServiceWorkerRegistration";
import { appName, getPublicEnv } from "@/lib/env";
import "./globals.css";

const name = appName();

export const metadata: Metadata = {
  metadataBase: new URL(getPublicEnv().NEXT_PUBLIC_APP_URL),
  title: { default: `${name} | Local-first word processor`, template: `%s | ${name}` },
  description:
    "A local-first word processor: rich text, page layout, comments, version snapshots, and DOCX/PDF export, stored in your browser.",
  applicationName: name,
  manifest: "/manifest.webmanifest",
  icons: { icon: "/textdoc-icon.svg" },
  openGraph: {
    title: name,
    description: "Write, format, and export documents without an account.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: "#12141a",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <div id="main-content">{children}</div>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}

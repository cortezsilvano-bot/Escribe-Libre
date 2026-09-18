import type { Metadata } from "next";
import { Suspense } from "react";
import { PrintRoute } from "./PrintRoute";

export const metadata: Metadata = {
  title: "Print preview",
  description: "Paginated print and PDF view of a document.",
  robots: { index: false, follow: false },
};

export default function PrintPage() {
  return (
    <Suspense fallback={<main className="print-shell">Preparing print view...</main>}>
      <PrintRoute />
    </Suspense>
  );
}

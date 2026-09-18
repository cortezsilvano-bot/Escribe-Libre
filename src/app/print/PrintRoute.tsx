"use client";

import NextLink from "next/link";
import { useSearchParams } from "next/navigation";
import { PrintDocument } from "@/components/editor/PrintDocument";

export function PrintRoute() {
  const documentId = useSearchParams().get("doc");

  if (!documentId) {
    return (
      <main className="print-shell">
        <p>No document selected.</p>
        <NextLink href="/">Back to documents</NextLink>
      </main>
    );
  }

  return <PrintDocument documentId={documentId} />;
}

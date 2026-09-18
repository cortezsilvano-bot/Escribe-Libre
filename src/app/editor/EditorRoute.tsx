"use client";

import NextLink from "next/link";
import { useSearchParams } from "next/navigation";
import { DocumentEditor } from "@/components/editor/DocumentEditor";

export function EditorRoute() {
  const documentId = useSearchParams().get("doc");

  if (!documentId) {
    return (
      <main className="editor-error">
        <h1>No document selected</h1>
        <p>Open a document from the dashboard to start editing.</p>
        <NextLink href="/">Back to documents</NextLink>
      </main>
    );
  }

  return <DocumentEditor documentId={documentId} />;
}

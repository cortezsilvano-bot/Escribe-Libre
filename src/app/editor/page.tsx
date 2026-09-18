import type { Metadata } from "next";
import { Suspense } from "react";
import { EditorRoute } from "./EditorRoute";

export const metadata: Metadata = {
  title: "Editor",
  description: "Write and format a document in the Escribe Libre editor.",
};

export default function EditorPage() {
  return (
    <Suspense fallback={<main className="editor-loading">Loading editor...</main>}>
      <EditorRoute />
    </Suspense>
  );
}

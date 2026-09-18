import type { Metadata } from "next";
import { DocumentEditor } from "@/components/editor/DocumentEditor";

export const metadata: Metadata = {
  title: "Editor",
  description: "Write and format a document in the Escribe Libre editor.",
};

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DocumentEditor documentId={id} />;
}

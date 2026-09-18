import type { Metadata } from "next";
import { PrintDocument } from "@/components/editor/PrintDocument";

export const metadata: Metadata = {
  title: "Print preview",
  description: "Paginated print and PDF view of a document.",
  robots: { index: false, follow: false },
};

export default async function DocumentPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PrintDocument documentId={id} />;
}

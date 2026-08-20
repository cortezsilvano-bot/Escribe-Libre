import type { Metadata } from "next";
import { SavedSearchManager } from "@/components/account/SavedSearchManager";
export const metadata: Metadata = { title: "Saved searches", robots: { index: false } };
export default function SavedSearchesPage() { return <SavedSearchManager />; }

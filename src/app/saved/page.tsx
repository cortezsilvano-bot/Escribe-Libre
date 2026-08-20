import type { Metadata } from "next";
import { SavedListings } from "@/components/account/SavedListings";
export const metadata: Metadata = { title: "Saved rentals", robots: { index: false } };
export default function SavedPage() { return <SavedListings />; }

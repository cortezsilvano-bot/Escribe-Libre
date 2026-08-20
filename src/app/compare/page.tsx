import type { Metadata } from "next";
import { CompareListings } from "@/components/account/CompareListings";
export const metadata: Metadata = { title: "Compare rentals", robots: { index: false } };
export default function ComparePage() { return <CompareListings />; }

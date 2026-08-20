import type { Metadata } from "next";
import { LocationLanding } from "@/components/locations/LocationLanding";
export const metadata: Metadata = { title: "Houston, TX rentals", alternates: { canonical: "/rentals/houston-tx" } };
export default function HoustonRentalsPage(){ return <LocationLanding/>; }

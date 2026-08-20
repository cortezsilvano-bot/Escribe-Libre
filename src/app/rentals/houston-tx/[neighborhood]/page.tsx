import type { Metadata } from "next";
import { LocationLanding } from "@/components/locations/LocationLanding";
import { houstonNeighborhoods } from "@/data/houston-listings";

const findName = (slug: string) => houstonNeighborhoods.find((item) => item.toLowerCase().replace(/\s+/g, "-") === slug.toLowerCase()) ?? slug.replaceAll("-", " ").replace(/\b\w/g, (value) => value.toUpperCase());
export async function generateMetadata({ params }: { params: Promise<{ neighborhood: string }> }): Promise<Metadata> { const slug = (await params).neighborhood; const known = houstonNeighborhoods.some((item) => item.toLowerCase().replace(/\s+/g, "-") === slug); return { title: `${findName(slug)} rentals`, robots: known ? undefined : { index: false, follow: true }, alternates: { canonical: `/rentals/houston-tx/${slug}` } }; }
export default async function NeighborhoodRentalsPage({ params }: { params: Promise<{ neighborhood: string }> }){ return <LocationLanding neighborhood={findName((await params).neighborhood)}/>; }

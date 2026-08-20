import { houstonNeighborhoods } from "@/data/houston-listings";
import { ok } from "@/lib/api/response";
export async function GET(request: Request) { const q = new URL(request.url).searchParams.get("q")?.trim().toLowerCase() ?? ""; const items = ["Houston, TX", ...houstonNeighborhoods.map((name) => `${name}, TX`)].filter((item) => item.toLowerCase().includes(q)).slice(0, 8).map((label) => ({ id: label.toLowerCase().replace(/\W+/g, "-"), label, type: label.startsWith("Houston") ? "city" : "neighborhood" })); return ok({ items }); }

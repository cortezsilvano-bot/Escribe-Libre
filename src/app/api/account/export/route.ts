import { ok } from "@/lib/api/response";
export async function POST() { return ok({ exportId: crypto.randomUUID(), status: "queued", format: "json", includes: ["profile", "saved listings", "saved searches", "contact and tour metadata"] }, { status: 202 }); }

import { z } from "zod";
import { ok, parseJson } from "@/lib/api/response";
const schema = z.object({ providerType: z.enum(["individual_landlord", "property_manager", "leasing_representative"]), authorityAttested: z.literal(true), evidenceMetadata: z.object({ hostedProviderReference: z.string().max(200).optional(), note: z.string().max(1_000).optional() }) });
export async function POST(request: Request) { const parsed = await parseJson(request, schema); if ("response" in parsed) return parsed.response; return ok({ id: crypto.randomUUID(), status: "identity_pending", rawDocumentsStored: false }, { status: 201 }); }

import { z } from "zod";
import { ok, parseJson } from "@/lib/api/response";
const schema = z.object({ confirmation: z.literal("DELETE MY ACCOUNT"), retainAuditRecords: z.literal(true) });
export async function POST(request: Request) { const parsed = await parseJson(request, schema); if ("response" in parsed) return parsed.response; return ok({ status: "scheduled", revokesSessions: true, auditRecordsAnonymizedWherePermitted: true }, { status: 202 }); }

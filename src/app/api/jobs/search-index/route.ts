import { ok, problem } from "@/lib/api/response";
export async function POST(request: Request) { if (process.env.QSTASH_CURRENT_SIGNING_KEY && !request.headers.get("upstash-signature")) return problem(401, "INVALID_JOB_SIGNATURE", "A valid QStash signature is required."); return ok({ processed: 0, failed: 0, mode: "mock", message: "No pending outbox records in fixture mode." }); }

import { NextResponse } from "next/server";
import type { ZodType } from "zod";

export const ok = <T>(data: T, init?: ResponseInit) => NextResponse.json({ ok: true, data, meta: { requestId: crypto.randomUUID() } }, init);
export const problem = (status: number, code: string, message: string, details?: unknown) => NextResponse.json({ ok: false, error: { code, message, details }, meta: { requestId: crypto.randomUUID() } }, { status });

export async function parseJson<T>(request: Request, schema: ZodType<T>): Promise<{ data: T } | { response: NextResponse }> {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return { response: problem(400, "VALIDATION_ERROR", "The request did not pass validation.", parsed.error.flatten()) };
    return { data: parsed.data };
  } catch { return { response: problem(400, "INVALID_JSON", "A valid JSON request body is required.") }; }
}

export function demoIdempotency(request: Request) {
  return request.headers.get("idempotency-key") ?? crypto.randomUUID();
}

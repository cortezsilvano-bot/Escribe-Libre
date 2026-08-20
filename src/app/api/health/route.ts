import { ok } from "@/lib/api/response";
export async function GET() { return ok({ status: "healthy", service: "rental-marketplace-web", time: new Date().toISOString(), mode: process.env.APP_DATA_MODE ?? "mock" }); }

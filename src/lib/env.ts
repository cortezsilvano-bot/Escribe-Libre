import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default("Escribe Libre"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional().or(z.literal("")),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
});

const serverEnvSchema = publicEnvSchema.extend({
  // "mock" keeps every document in the browser (IndexedDB). "supabase" is the
  // opt-in path for account-backed sync.
  APP_DATA_MODE: z.enum(["mock", "supabase"]).default("mock"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
});

export function getPublicEnv() {
  return publicEnvSchema.parse({
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}

export function getServerEnv() {
  const env = serverEnvSchema.parse({ ...process.env });
  if (process.env.NODE_ENV === "production" && env.APP_DATA_MODE === "supabase") {
    const required: Array<[string, unknown]> = [
      ["NEXT_PUBLIC_SUPABASE_URL", env.NEXT_PUBLIC_SUPABASE_URL],
      ["NEXT_PUBLIC_SUPABASE_ANON_KEY", env.NEXT_PUBLIC_SUPABASE_ANON_KEY],
      ["SUPABASE_SERVICE_ROLE_KEY", env.SUPABASE_SERVICE_ROLE_KEY],
    ];
    const missing = required.filter(([, value]) => !value).map(([name]) => name);
    if (missing.length) throw new Error(`Missing production environment variables: ${missing.join(", ")}`);
  }
  return env;
}

export function isSupabaseConfigured() {
  const env = getPublicEnv();
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export const appName = () => getPublicEnv().NEXT_PUBLIC_APP_NAME;

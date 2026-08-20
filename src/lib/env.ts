import { z } from "zod";

const booleanString = z.enum(["true", "false"]).default("false").transform((value) => value === "true");

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default("Escribe Libre"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional().or(z.literal("")),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  NEXT_PUBLIC_MAPBOX_TOKEN: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional().or(z.literal("")),
});

const serverEnvSchema = publicEnvSchema.extend({
  APP_DATA_MODE: z.enum(["mock", "supabase"]).default("mock"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  TYPESENSE_HOST: z.string().optional(),
  TYPESENSE_ADMIN_API_KEY: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional().or(z.literal("")),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  ENABLE_RENTCAST: booleanString,
  RENTCAST_API_KEY: z.string().optional(),
  ENABLE_AI_SEARCH: booleanString,
  ENABLE_AI_SUMMARIES: booleanString,
  OPENAI_API_KEY: z.string().optional(),
  ENABLE_SMS: booleanString,
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  ENABLE_PROVIDER_BILLING: booleanString,
  STRIPE_SECRET_KEY: z.string().optional(),
});

export function getPublicEnv() {
  return publicEnvSchema.parse({
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
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

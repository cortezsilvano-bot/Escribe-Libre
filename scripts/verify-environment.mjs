const mode = process.env.APP_DATA_MODE ?? "mock";
const required = mode === "supabase" && process.env.NODE_ENV === "production" ? ["NEXT_PUBLIC_APP_NAME", "NEXT_PUBLIC_APP_URL", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"] : [];
const missing = required.filter((name) => !process.env[name]);
if (missing.length) { console.error(`Missing required environment variables: ${missing.join(", ")}`); process.exit(1); }
for (const [flag, key] of [["ENABLE_RENTCAST", "RENTCAST_API_KEY"], ["ENABLE_AI_SEARCH", "OPENAI_API_KEY"], ["ENABLE_SMS", "TWILIO_AUTH_TOKEN"], ["ENABLE_PROVIDER_BILLING", "STRIPE_SECRET_KEY"]]) { if (process.env[flag] === "true" && !process.env[key]) { console.error(`${key} is required when ${flag}=true`); process.exit(1); } }
console.log(`Environment is valid for ${mode} mode. Secret values were not printed.`);

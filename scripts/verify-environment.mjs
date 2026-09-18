const mode = process.env.APP_DATA_MODE ?? "mock";

// Local mode needs nothing: documents live in the browser. Only the opt-in
// Supabase sync mode has required variables, and only in production.
const required =
  mode === "supabase" && process.env.NODE_ENV === "production"
    ? [
        "NEXT_PUBLIC_APP_NAME",
        "NEXT_PUBLIC_APP_URL",
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "SUPABASE_SERVICE_ROLE_KEY",
      ]
    : [];

const missing = required.filter((name) => !process.env[name]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

if (process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) {
  console.error("SUPABASE_SERVICE_ROLE_KEY must never be exposed with a NEXT_PUBLIC_ prefix.");
  process.exit(1);
}

console.log(`Environment is valid for ${mode} mode. Secret values were not printed.`);

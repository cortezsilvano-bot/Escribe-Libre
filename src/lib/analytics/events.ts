export type AnalyticsEvent =
  | "search_submitted" | "filter_applied" | "filter_removed" | "map_moved" | "search_area_refreshed" | "listing_viewed" | "listing_saved" | "listing_unsaved" | "comparison_started"
  | "saved_search_created" | "alert_enabled" | "contact_request_submitted" | "tour_requested" | "provider_registered" | "provider_verification_submitted" | "listing_created"
  | "listing_submitted" | "listing_approved" | "listing_rejected" | "listing_expired" | "fraud_report_submitted" | "zero_results" | "search_error" | "import_started" | "import_completed" | "import_failed";
type SafeProperties = Record<string, string | number | boolean | null>;
export function track(event: AnalyticsEvent, properties: SafeProperties = {}) { if (typeof window === "undefined" || !process.env.NEXT_PUBLIC_POSTHOG_KEY) return; window.dispatchEvent(new CustomEvent("marketplace:analytics", { detail: { event, properties } })); }

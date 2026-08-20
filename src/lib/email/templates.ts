export type EmailTemplate =
  | "email_verification" | "passwordless_login" | "provider_onboarding" | "listing_submitted" | "listing_approved" | "listing_rejected"
  | "listing_expiration_warning" | "listing_expired" | "new_lead" | "tour_request" | "tour_confirmation" | "saved_search_match"
  | "price_change" | "availability_change" | "scam_report_received";

const subjects: Record<EmailTemplate, string> = {
  email_verification: "Verify your email", passwordless_login: "Your secure sign-in link", provider_onboarding: "Continue provider onboarding",
  listing_submitted: "Listing submitted for review", listing_approved: "Listing approved", listing_rejected: "Listing needs changes",
  listing_expiration_warning: "Listing expiration reminder", listing_expired: "Listing expired", new_lead: "New rental inquiry",
  tour_request: "New tour request", tour_confirmation: "Tour request updated", saved_search_match: "New rentals match your search",
  price_change: "A saved rental changed price", availability_change: "Availability changed", scam_report_received: "We received your report",
};

export function renderEmailPreview(template: EmailTemplate, values: { recipientName?: string; actionUrl?: string; body?: string; unsubscribeUrl?: string }) {
  const greeting = values.recipientName ? `Hi ${values.recipientName},` : "Hello,";
  const body = values.body ?? "There is an update in your Rental Marketplace account.";
  return {
    subject: subjects[template],
    text: `${greeting}\n\n${body}${values.actionUrl ? `\n\nOpen: ${values.actionUrl}` : ""}${values.unsubscribeUrl ? `\n\nManage preferences: ${values.unsubscribeUrl}` : ""}`,
    html: `<!doctype html><html lang="en"><body style="font-family:Arial,sans-serif;color:#163633;max-width:640px;margin:auto;padding:24px"><h1 style="font-size:24px">${subjects[template]}</h1><p>${greeting}</p><p>${body}</p>${values.actionUrl ? `<p><a href="${values.actionUrl}" style="background:#123f3a;color:white;padding:12px 18px;border-radius:8px;display:inline-block">View update</a></p>` : ""}<hr><p style="font-size:12px">Never send money before verifying the property, the person offering it, the lease, and the payment method.</p>${values.unsubscribeUrl ? `<p><a href="${values.unsubscribeUrl}">Manage notification preferences</a></p>` : ""}</body></html>`,
  };
}

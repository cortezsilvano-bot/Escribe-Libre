import type { RentalListing, VerificationRecord } from "@/domain/listing";

export function activeVerifications(records: VerificationRecord[], at = new Date()) {
  return records.filter((record) => record.status === "active" && (!record.expiresAt || new Date(record.expiresAt) >= at));
}

export function verificationLabel(listing: RentalListing, at = new Date()) {
  const records = activeVerifications(listing.verificationRecords, at);
  if (!records.length) return null;
  if (records.some((record) => record.level === "authority" || record.level === "business")) return "Authority verified";
  if (records.some((record) => record.level === "address")) return "Address verified";
  return "Provider contact verified";
}

export function freshnessLabel(updatedAt: string, at = new Date()) {
  const days = Math.max(0, Math.floor((at.getTime() - new Date(updatedAt).getTime()) / 86_400_000));
  if (days === 0) return "Updated today";
  if (days === 1) return "Updated yesterday";
  if (days <= 7) return `Updated ${days} days ago`;
  if (days <= 30) return `Updated ${Math.ceil(days / 7)} weeks ago`;
  return "Update may be stale";
}

const prohibitedPatterns = [
  /no\s+(?:children|kids|families)/i,
  /(?:christians?|muslims?|jews?)\s+only/i,
  /(?:men|women|whites?|blacks?|asians?)\s+only/i,
  /ideal\s+for\s+(?:young\s+)?(?:couples?|singles?)/i,
  /no\s+wheelchairs?/i,
];

export function scanListingContent(text: string) {
  return prohibitedPatterns.flatMap((pattern) => pattern.test(text) ? [{ code: "POTENTIAL_DISCRIMINATORY_LANGUAGE", pattern: pattern.source }] : []);
}

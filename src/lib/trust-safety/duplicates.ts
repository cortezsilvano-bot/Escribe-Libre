export interface DuplicateInput { normalizedAddress: string; unit?: string; latitude: number; longitude: number; bedrooms: number; bathrooms: number; squareFeet?: number; priceCents: number; providerId?: string; sourceId?: string; imageHashes?: string[]; descriptionTokens?: string[] }

export function normalizeAddress(raw: string) { return raw.normalize("NFKC").trim().toUpperCase().replace(/\bSTREET\b/g, "ST").replace(/\bAVENUE\b/g, "AVE").replace(/\bROAD\b/g, "RD").replace(/[.,#]/g, " ").replace(/\s+/g, " "); }

export function scoreDuplicate(a: DuplicateInput, b: DuplicateInput) {
  const reasons: string[] = [];
  let score = 0;
  if (a.normalizedAddress === b.normalizedAddress) { score += .4; reasons.push("normalized address matches"); }
  if ((a.unit ?? "") === (b.unit ?? "")) { score += .12; reasons.push("unit matches"); }
  const distance = Math.hypot(a.latitude - b.latitude, a.longitude - b.longitude);
  if (distance < .001) { score += .12; reasons.push("coordinates are very close"); }
  if (a.bedrooms === b.bedrooms && a.bathrooms === b.bathrooms) { score += .08; reasons.push("bed/bath matches"); }
  if (a.squareFeet && b.squareFeet && Math.abs(a.squareFeet - b.squareFeet) / Math.max(a.squareFeet, b.squareFeet) < .08) { score += .06; reasons.push("square footage is similar"); }
  if (Math.abs(a.priceCents - b.priceCents) / Math.max(a.priceCents, b.priceCents) < .08) { score += .06; reasons.push("price is similar"); }
  if (a.providerId && a.providerId === b.providerId) { score += .04; reasons.push("provider matches"); }
  if (a.sourceId && a.sourceId === b.sourceId) { score += .04; reasons.push("source identifier matches"); }
  if (a.imageHashes?.some((hash) => b.imageHashes?.includes(hash))) { score += .06; reasons.push("image hash matches"); }
  if (a.descriptionTokens?.length && b.descriptionTokens?.length) { const overlap = a.descriptionTokens.filter((token) => b.descriptionTokens?.includes(token)).length / Math.max(a.descriptionTokens.length, b.descriptionTokens.length); if (overlap > .7) { score += .02; reasons.push("description is similar"); } }
  return { score: Math.min(1, Number(score.toFixed(2))), reasons, recommendation: score >= .85 ? "review_likely_duplicate" : score >= .55 ? "review_possible_duplicate" : "low_confidence" } as const;
}

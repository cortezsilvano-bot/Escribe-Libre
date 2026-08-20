"use client";

import { GitCompareArrows, Heart, Share2 } from "lucide-react";
import { useStoredIds } from "@/lib/client/local-store";

export function ListingActions({ listingId, title }: { listingId: string; title: string }) {
  const saved = useStoredIds("rental:saved");
  const compared = useStoredIds("rental:compare");
  return <div className="detail-actions"><button className={saved.contains(listingId) ? "icon-action active" : "icon-action"} type="button" aria-label={saved.contains(listingId) ? `Remove ${title} from saved` : `Save ${title}`} onClick={() => saved.toggle(listingId)}><Heart fill={saved.contains(listingId) ? "currentColor" : "none"} /></button><button className={compared.contains(listingId) ? "icon-action active" : "icon-action"} type="button" aria-label={`Compare ${title}`} onClick={() => compared.toggle(listingId, 4)}><GitCompareArrows /></button><button className="icon-action" type="button" aria-label={`Share ${title}`} onClick={() => navigator.share ? navigator.share({ title, url: window.location.href }) : navigator.clipboard.writeText(window.location.href)}><Share2 /></button></div>;
}

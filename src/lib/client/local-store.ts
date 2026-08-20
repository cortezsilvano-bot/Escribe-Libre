"use client";

import { useSyncExternalStore } from "react";

const changed = "rental-marketplace-storage";
const empty = "[]";

function subscribe(callback: () => void) {
  window.addEventListener(changed, callback);
  window.addEventListener("storage", callback);
  return () => { window.removeEventListener(changed, callback); window.removeEventListener("storage", callback); };
}

export function useStoredIds(key: string) {
  const raw = useSyncExternalStore(subscribe, () => window.localStorage.getItem(key) ?? empty, () => empty);
  let ids: string[] = [];
  try { ids = JSON.parse(raw) as string[]; } catch { ids = []; }
  const toggle = (id: string, maximum?: number) => {
    const next = ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id].slice(-(maximum ?? 1_000));
    window.localStorage.setItem(key, JSON.stringify(next));
    window.dispatchEvent(new Event(changed));
  };
  return { ids, toggle, contains: (id: string) => ids.includes(id) };
}

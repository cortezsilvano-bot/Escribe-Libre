"use client";

import { z } from "zod";
import {
  defaultPageSettings,
  pageSizeSchema,
  type DocumentRecord,
  type PageSettings,
} from "@/lib/documents/document-model";

const settingsKey = "textdoc:settings";

export const autosaveDelayOptions = [300, 600, 1000] as const;
export const themeOptions = ["neon-dark", "light"] as const;

const localSettingsSchema = z.object({
  defaultPageSize: pageSizeSchema.default(defaultPageSettings.size),
  defaultFont: z.enum(["Arial", "Georgia", "Inter", "Times"]).default("Inter"),
  autosaveDelayMs: z.union([z.literal(300), z.literal(600), z.literal(1000)]).default(600),
  theme: z.enum(themeOptions).default("neon-dark"),
});

export type LocalSettings = z.infer<typeof localSettingsSchema>;

export const defaultLocalSettings: LocalSettings = {
  defaultPageSize: defaultPageSettings.size,
  defaultFont: "Inter",
  autosaveDelayMs: 600,
  theme: "neon-dark",
};

export function getLocalSettings(): LocalSettings {
  if (typeof window === "undefined") {
    return defaultLocalSettings;
  }

  const raw = window.localStorage.getItem(settingsKey);
  if (!raw) {
    return defaultLocalSettings;
  }

  const parsed = localSettingsSchema.safeParse(JSON.parse(raw) as unknown);
  return parsed.success ? parsed.data : defaultLocalSettings;
}

export function saveLocalSettings(settings: LocalSettings) {
  const parsed = localSettingsSchema.parse(settings);
  window.localStorage.setItem(settingsKey, JSON.stringify(parsed));
  applyTheme(parsed.theme);
}

export function applyTheme(theme: LocalSettings["theme"]) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.theme = theme;
}

export function applyLocalSettingsToRecord(record: DocumentRecord, settings: LocalSettings): DocumentRecord {
  const nextPageSettings: PageSettings = {
    ...record.pageSettings,
    size: settings.defaultPageSize,
  };

  return {
    ...record,
    pageSettings: nextPageSettings,
  };
}

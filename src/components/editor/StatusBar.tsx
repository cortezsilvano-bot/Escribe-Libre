"use client";

import type { PageSettings } from "@/lib/documents/document-model";

type StatusBarProps = {
  characterCount: number;
  wordCount: number;
  pageSettings: PageSettings;
  setPageSettings: (settings: PageSettings) => void;
};

export function StatusBar({ characterCount, wordCount, pageSettings, setPageSettings }: StatusBarProps) {
  return (
    <footer className="status-bar">
      <span aria-label="Document word count">Words: {wordCount.toLocaleString()}</span>
      <span aria-label="Document character count">Characters: {characterCount.toLocaleString()}</span>
      <span>Page preview</span>
      <label>
        Zoom
        <input
          max="2"
          min="0.5"
          onChange={(event) => setPageSettings({ ...pageSettings, zoom: Number(event.target.value) })}
          step="0.1"
          type="range"
          value={pageSettings.zoom}
        />
        {Math.round(pageSettings.zoom * 100)}%
      </label>
    </footer>
  );
}

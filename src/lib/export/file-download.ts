"use client";

export function safeFileStem(title: string) {
  return title.trim().replace(/[^\w-]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase() || "document";
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

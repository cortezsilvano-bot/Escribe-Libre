"use client";

import DOMPurify from "dompurify";
import mammoth from "mammoth";

const maxBytes = 20 * 1024 * 1024;

const styleMap = [
  "p[style-name='Title'] => h1:fresh",
  "p[style-name='Subtitle'] => h2:fresh",
  "p[style-name='Heading 1'] => h1:fresh",
  "p[style-name='Heading 2'] => h2:fresh",
  "p[style-name='Heading 3'] => h3:fresh",
];

export type DocxImportResult = {
  html: string;
  warnings: string[];
};

/**
 * Converts a Word file to sanitised HTML in the browser.
 *
 * This runs client-side on purpose: it keeps the document on the device, works
 * with no network, and lets the app build as a static bundle for the desktop
 * shell, which cannot host a route handler.
 */
export async function convertDocxToHtml(file: File): Promise<DocxImportResult> {
  if (!file.name.toLowerCase().endsWith(".docx")) {
    throw new Error("Only .docx Word documents can be imported.");
  }

  if (file.size <= 0 || file.size > maxBytes) {
    throw new Error("The document must be between 1 byte and 20 MB.");
  }

  let value: string;
  let messages: Array<{ type: string; message: string }>;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer }, { styleMap });
    value = result.value;
    messages = result.messages;
  } catch {
    throw new Error("The DOCX file could not be read. It may be corrupt or password protected.");
  }

  // Mammoth emits a narrow HTML subset, but the output still reaches the editor
  // as markup, so it is sanitised before it is inserted.
  const html = DOMPurify.sanitize(value, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["script", "iframe", "object", "embed", "style"],
    FORBID_ATTR: ["srcset"],
  });

  return {
    html,
    warnings: messages.filter((message) => message.type === "warning").map((message) => message.message),
  };
}

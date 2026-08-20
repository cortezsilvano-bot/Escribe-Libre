import { describe, expect, it } from "vitest";
import {
  createDocumentRecord,
  defaultPageSettings,
  documentCommentSchema,
  normalizeDocumentRecord,
  pageSettingsSchema,
} from "./document-model";

describe("document model", () => {
  it("creates records with complete local page defaults", () => {
    const record = createDocumentRecord("doc_1", "Roadmap");

    expect(record.title).toBe("Roadmap");
    expect(record.pageSettings).toEqual(defaultPageSettings);
    expect(new Date(record.createdAt).toString()).not.toBe("Invalid Date");
    expect(record.updatedAt).toBe(record.createdAt);
  });

  it("normalizes older records that do not have newer page fields", () => {
    const now = new Date().toISOString();
    const record = normalizeDocumentRecord({
      id: "doc_2",
      title: "Legacy",
      content: { type: "doc", content: [] },
      pageSettings: {
        size: "letter",
        orientation: "portrait",
        margins: { top: 1, right: 1, bottom: 1, left: 1 },
        zoom: 1,
      },
      createdAt: now,
      updatedAt: now,
    });

    expect(record.pageSettings.headerText).toBe("");
    expect(record.pageSettings.footerText).toBe("");
    expect(record.pageSettings.showPageNumbers).toBe(true);
  });

  it("fills page settings defaults from partial objects", () => {
    expect(pageSettingsSchema.parse({})).toEqual(defaultPageSettings);
  });

  it("validates review comments and defaults them to unresolved", () => {
    const now = new Date().toISOString();
    const comment = documentCommentSchema.parse({
      id: "comment_1",
      documentId: "doc_1",
      body: "Needs a tighter intro.",
      createdAt: now,
      updatedAt: now,
    });

    expect(comment.resolved).toBe(false);
  });
});

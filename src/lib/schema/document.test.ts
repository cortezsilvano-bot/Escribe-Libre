import { describe, expect, it } from "vitest";
import { createDocumentRecord, normalizeDocumentRecord } from "./document";
import { documentTemplates } from "../documents/templates";
import { getSchema } from "@tiptap/core";
import { getEditorExtensions } from "../editor/editor-extensions";

describe("canonical document boundary", () => {
  it("accepts live ProseMirror JSON with shared null-prototype attributes", () => {
    const schema = getSchema(getEditorExtensions());
    const paragraph = schema.nodes.paragraph.create();
    const content = schema.nodes.doc.create(null, [paragraph, paragraph]).toJSON();
    expect(normalizeDocumentRecord({ ...createDocumentRecord("live"), content }).content).toEqual(content);
  });
  it("migrates unversioned records without changing identity or dates", () => {
    const current = createDocumentRecord("legacy");
    const legacy = { ...current, schemaVersion: undefined };
    expect(normalizeDocumentRecord(legacy)).toEqual(current);
    expect(legacy.schemaVersion).toBeUndefined();
  });

  it("rejects future versions", () => {
    expect(() => normalizeDocumentRecord({ ...createDocumentRecord("future"), schemaVersion: 2 })).toThrow();
  });

  it.each([
    null,
    { type: "paragraph" },
    { type: "doc", content: [{ type: "unknown" }] },
    { type: "doc", content: [{ type: "text", text: "Invalid block child" }] },
    { type: "doc", content: [{ type: "paragraph", attrs: { value: () => 1 } }] },
    { type: "doc", content: [{ type: "paragraph", attrs: { value: Infinity } }] },
    { type: "doc", content: [{ type: "image", attrs: { src: "javascript:alert(1)" } }] },
    { type: "doc", content: [{ type: "paragraph", attrs: { textAlign: {} } }] },
  ])("rejects malformed or nonserializable content %j", (content) => {
    expect(() => normalizeDocumentRecord({ ...createDocumentRecord("bad"), content })).toThrow();
  });

  it("rejects cyclic input without recursion overflow", () => {
    const content: Record<string, unknown> = { type: "doc" };
    content.content = [content];
    expect(() => normalizeDocumentRecord({ ...createDocumentRecord("cycle"), content })).toThrow();
  });

  it("migrates legacy empty content to an editable paragraph", () => {
    const record = normalizeDocumentRecord({ ...createDocumentRecord("empty"), content: { type: "doc", content: [] } });
    expect(record.content.content).toEqual([{ type: "paragraph" }]);
  });

  it("accepts every shipped template", () => {
    for (const template of documentTemplates) {
      const record = template.create();
      expect(normalizeDocumentRecord(record)).toEqual(record);
    }
  });

  it("does not share mutable defaults between documents", () => {
    const first = createDocumentRecord("first");
    first.pageSettings.margins.top = 2;
    first.content.content = [];
    const second = createDocumentRecord("second");
    expect(second.pageSettings.margins.top).toBe(1);
    expect(second.content.content?.length).toBeGreaterThan(0);
  });
});

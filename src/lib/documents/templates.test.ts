import { describe, expect, it } from "vitest";
import { documentRecordSchema } from "./document-model";
import { documentTemplates } from "./templates";

describe("document templates", () => {
  it("exposes unique template ids", () => {
    const ids = documentTemplates.map((template) => template.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("creates valid local document records from every template", () => {
    for (const template of documentTemplates) {
      const record = documentRecordSchema.parse(template.create());

      expect(record.id).toBeTruthy();
      expect(record.title).toBeTruthy();
      expect(record.content).toMatchObject({ type: "doc" });
    }
  });

  it("adds printable headers and footers for structured templates", () => {
    const structuredTemplates = documentTemplates.filter((template) => template.id !== "blank");

    for (const template of structuredTemplates) {
      const record = template.create();

      expect(record.pageSettings.headerText).toBe(record.title);
      expect(record.pageSettings.footerText).toBe("Textdoc");
    }
  });
});

import { describe, expect, it } from "vitest";
import { getCharacterCountFromJson, getWordCountFromJson } from "./text-index";

const sampleDocument = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [{ type: "text", text: "One two" }],
    },
    {
      type: "paragraph",
      content: [{ type: "text", text: "three" }],
    },
  ],
};

describe("text index metrics", () => {
  it("counts words from Tiptap JSON text nodes", () => {
    expect(getWordCountFromJson(sampleDocument)).toBe(3);
  });

  it("counts characters from Tiptap JSON text nodes", () => {
    expect(getCharacterCountFromJson(sampleDocument)).toBe(12);
  });
});

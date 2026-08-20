import { describe, expect, it } from "vitest";
import type { AnyExtension } from "@tiptap/core";
import { getEditorExtensions } from "./editor-extensions";

type ExtensionWithNestedConfig = AnyExtension & {
  config: {
    addExtensions?: (this: AnyExtension) => AnyExtension[];
  };
};

function flattenExtensionNames(extensions: AnyExtension[]): string[] {
  return extensions.flatMap((extension) => {
    const extensionWithNestedConfig = extension as ExtensionWithNestedConfig;
    const nestedExtensions = extensionWithNestedConfig.config.addExtensions?.call(extension);
    return [extension.name, ...(nestedExtensions ? flattenExtensionNames(nestedExtensions) : [])];
  });
}

describe("editor extensions", () => {
  it("does not register duplicate extension names", () => {
    const names = flattenExtensionNames(getEditorExtensions());
    const duplicates = names.filter((name, index) => names.indexOf(name) !== index);

    expect(duplicates).toEqual([]);
  });

  it("keeps the core word-processing capabilities registered", () => {
    const names = new Set(flattenExtensionNames(getEditorExtensions()));

    expect(names.has("heading")).toBe(true);
    expect(names.has("link")).toBe(true);
    expect(names.has("underline")).toBe(true);
    expect(names.has("table")).toBe(true);
    expect(names.has("textStyle")).toBe(true);
    expect(names.has("inlineComment")).toBe(true);
    expect(names.has("spellCheckIndicator")).toBe(true);
    expect(names.has("pageBreak")).toBe(true);
  });
});

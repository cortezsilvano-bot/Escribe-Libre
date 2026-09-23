import { getSchema, type JSONContent } from "@tiptap/core";
import { z } from "zod";
import { getEditorExtensions } from "../editor/editor-extensions";

let editorSchema: ReturnType<typeof getSchema> | undefined;

function validAttributes(content: JSONContent): boolean {
  const pending = [content];
  while (pending.length) {
    const node = pending.pop()!;
    for (const item of [node, ...(node.marks ?? [])]) {
      for (const [key, value] of Object.entries(item.attrs ?? {})) {
        if (value === null) continue;
        if (key === "colwidth") {
          if (!Array.isArray(value) || !value.every((width) => Number.isFinite(width) && width >= 0)) return false;
        } else if (["level", "colspan", "rowspan", "start"].includes(key)) {
          if (!Number.isSafeInteger(value) || value < 1) return false;
        } else if (["src", "href"].includes(key)) {
          if (typeof value !== "string" || /[\u0000-\u0020\u007f]/.test(value)) return false;
          // Local relative URLs and approved explicit protocols only.
          if (/^[a-z][a-z\d+.-]*:/i.test(value) && !/^(https?:|mailto:|tel:)/i.test(value)) return false;
        } else if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") {
          return false;
        }
      }
    }
    pending.push(...(node.content ?? []));
  }
  return true;
}

function isBoundedJson(input: unknown): boolean {
  const stack: Array<{ value: unknown; depth: number; leave?: boolean }> = [{ value: input, depth: 0 }];
  const seen = new Set<object>();
  let count = 0;
  let textSize = 0;
  while (stack.length) {
    const { value, depth, leave } = stack.pop()!;
    if (leave) {
      seen.delete(value as object);
      continue;
    }
    if (++count > 200_000 || depth > 100) return false;
    if (value === null || typeof value === "boolean") continue;
    if (typeof value === "string") {
      textSize += value.length;
      if (textSize > 20_000_000) return false;
      continue;
    }
    if (typeof value === "number") {
      if (!Number.isFinite(value)) return false;
      continue;
    }
    if (typeof value !== "object" || seen.has(value)) return false;
    const prototype = Object.getPrototypeOf(value);
    if (!Array.isArray(value) && prototype !== Object.prototype && prototype !== null) return false;
    seen.add(value);
    stack.push({ value, depth, leave: true });
    for (const child of Object.values(value)) stack.push({ value: child, depth: depth + 1 });
  }
  return true;
}

export const editorContentSchema = z.custom<JSONContent>((input) => {
  try {
    if (!isBoundedJson(input) || !input || typeof input !== "object") return false;
    const content = input as JSONContent;
    if (content.type !== "doc") return false;
    if (!validAttributes(content)) return false;
    editorSchema ??= getSchema(getEditorExtensions());
    // Older empty documents are migrated to a valid empty paragraph below.
    const candidate = content.content?.length === 0
      ? { ...content, content: [{ type: "paragraph" }] }
      : content;
    editorSchema.nodeFromJSON(candidate).check();
    return true;
  } catch {
    return false;
  }
}, "Invalid or unsupported editor document").transform((content) =>
  content.content?.length === 0 ? { ...content, content: [{ type: "paragraph" }] } : content,
);

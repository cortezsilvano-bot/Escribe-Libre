import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyleKit } from "@tiptap/extension-text-style";
import StarterKit from "@tiptap/starter-kit";
import { InlineComment } from "./inline-comment-extension";
import { PageBreak } from "./page-break-extension";
import { SpellCheckIndicator } from "./spellcheck-indicator-extension";

export function getEditorExtensions() {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
    }),
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    TextStyleKit,
    Highlight.configure({ multicolor: true }),
    Image.configure({
      allowBase64: false,
      inline: false,
    }),
    TableKit.configure({
      table: { resizable: true },
    }),
    InlineComment,
    SpellCheckIndicator,
    PageBreak,
  ];
}

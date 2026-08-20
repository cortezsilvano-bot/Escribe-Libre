import { Extension } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "prosemirror-model";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

const commonMisspellings = ["teh", "recieve", "definately", "accomodate", "seperate"];

export const SpellCheckIndicator = Extension.create({
  name: "spellCheckIndicator",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("spellCheckIndicator"),
        state: {
          init(_, { doc }) {
            return getSpellcheckDecorations(doc);
          },
          apply(transaction, previousDecorations) {
            if (transaction.docChanged) {
              return getSpellcheckDecorations(transaction.doc);
            }

            return previousDecorations.map(transaction.mapping, transaction.doc);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state) as DecorationSet;
          },
        },
      }),
    ];
  },
});

function getSpellcheckDecorations(doc: ProseMirrorNode) {
  const decorations: Decoration[] = [];

  doc.descendants((node, position) => {
    if (!node.isText || !node.text) {
      return;
    }

    for (const word of commonMisspellings) {
      const pattern = new RegExp(`\\b${word}\\b`, "gi");
      let match = pattern.exec(node.text);

      while (match) {
        const start = position + match.index;
        const end = start + match[0].length;
        decorations.push(
          Decoration.inline(start, end, {
            class: "spellcheck-warning",
            title: "Possible spelling issue",
          }),
        );
        match = pattern.exec(node.text);
      }
    }
  });

  return DecorationSet.create(doc, decorations);
}

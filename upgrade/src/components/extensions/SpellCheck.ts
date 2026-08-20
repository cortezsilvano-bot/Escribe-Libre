import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

const misspelledWords = ['teh', 'recieve', 'definately', 'accomodate', 'seperate'];

export const SpellCheckIndicator = Extension.create({
  name: 'spellCheckIndicator',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('spellCheckIndicator'),
        state: {
          init(_, { doc }) {
            return getDecorations(doc);
          },
          apply(tr, oldState) {
            if (tr.docChanged) {
              return getDecorations(tr.doc);
            }
            return oldState.map(tr.mapping, tr.doc);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});

function getDecorations(doc: any) {
  const decorations: Decoration[] = [];
  doc.descendants((node: any, pos: number) => {
    if (node.isText && node.text) {
      const text = node.text;
      misspelledWords.forEach(word => {
        let index = 0;
        while ((index = text.toLowerCase().indexOf(word, index)) !== -1) {
          const start = pos + index;
          const end = start + word.length;
          decorations.push(
            Decoration.inline(start, end, {
              class: 'underline decoration-red-500 decoration-wavy decoration-2 underline-offset-2 bg-red-50/50',
              title: 'Misspelled word',
            })
          );
          index += word.length;
        }
      });
    }
  });
  return DecorationSet.create(doc, decorations);
}

import { mergeAttributes, Node } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    pageBreak: {
      setPageBreak: () => ReturnType;
    };
  }
}

export const PageBreak = Node.create({
  name: "pageBreak",

  group: "block",

  atom: true,

  selectable: true,

  parseHTML() {
    return [
      { tag: "div[data-type='page-break']" },
      { tag: "hr[data-type='page-break']" },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "page-break",
        class: "page-break",
      }),
      ["span", {}, "Page break"],
    ];
  },

  addCommands() {
    return {
      setPageBreak:
        () =>
        ({ commands }) =>
          commands.insertContent({ type: this.name }),
    };
  },
});

import { Mark, mergeAttributes } from "@tiptap/core";

type InlineCommentAttributes = {
  id: string;
  body: string;
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    inlineComment: {
      setInlineComment: (attributes: InlineCommentAttributes) => ReturnType;
      unsetInlineComment: () => ReturnType;
    };
  }
}

export const InlineComment = Mark.create({
  name: "inlineComment",

  inclusive: false,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-comment-id"),
        renderHTML: (attributes) => {
          if (!attributes.id) {
            return {};
          }

          return { "data-comment-id": attributes.id as string };
        },
      },
      body: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-comment-body"),
        renderHTML: (attributes) => {
          if (!attributes.body) {
            return {};
          }

          return {
            "data-comment-body": attributes.body as string,
            title: attributes.body as string,
          };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-comment-id]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(
        {
          class: "inline-comment",
        },
        HTMLAttributes,
      ),
      0,
    ];
  },

  addCommands() {
    return {
      setInlineComment:
        (attributes: InlineCommentAttributes) =>
        ({ commands }) =>
          commands.setMark(this.name, attributes),
      unsetInlineComment:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    };
  },
});

import { Mark, mergeAttributes } from '@tiptap/core';

export interface CommentOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    comment: {
      /**
       * Set a comment mark
       */
      setComment: (comment: string) => ReturnType;
      /**
       * Toggle a comment mark
       */
      toggleComment: (comment: string) => ReturnType;
      /**
       * Unset a comment mark
       */
      unsetComment: () => ReturnType;
    };
  }
}

export const CommentMark = Mark.create<CommentOptions>({
  name: 'comment',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'bg-yellow-200/60 border-b-2 border-yellow-400 cursor-pointer transition-colors hover:bg-yellow-300/80',
      },
    };
  },

  addAttributes() {
    return {
      commentId: {
        default: null,
        parseHTML: element => element.getAttribute('data-comment-id'),
        renderHTML: attributes => {
          if (!attributes.commentId) {
            return {};
          }
          return {
            'data-comment-id': attributes.commentId,
          };
        },
      },
      commentText: {
        default: null,
        parseHTML: element => element.getAttribute('data-comment-text'),
        renderHTML: attributes => {
          if (!attributes.commentText) {
            return {};
          }
          return {
            'data-comment-text': attributes.commentText,
            'title': attributes.commentText,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-comment-id]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setComment: (text: string) => ({ commands }) => {
        return commands.setMark(this.name, { commentId: Math.random().toString(36).substring(7), commentText: text });
      },
      toggleComment: (text: string) => ({ commands }) => {
        return commands.toggleMark(this.name, { commentId: Math.random().toString(36).substring(7), commentText: text });
      },
      unsetComment: () => ({ commands }) => {
        return commands.unsetMark(this.name);
      },
    };
  },
});

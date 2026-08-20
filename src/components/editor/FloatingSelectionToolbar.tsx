"use client";

import type { Editor } from "@tiptap/react";
import { Bold, Highlighter, Italic, MessageSquarePlus, Underline } from "lucide-react";
import { useEffect, useState } from "react";
import clsx from "clsx";

type FloatingSelectionToolbarProps = {
  editor: Editor;
  onCreateComment: (body: string) => void;
};

type ToolbarPosition = {
  left: number;
  top: number;
};

export function FloatingSelectionToolbar({ editor, onCreateComment }: FloatingSelectionToolbarProps) {
  const [position, setPosition] = useState<ToolbarPosition | null>(null);

  useEffect(() => {
    function updatePosition() {
      const { from, to, empty } = editor.state.selection;
      if (empty || !editor.view.hasFocus()) {
        setPosition(null);
        return;
      }

      try {
        const start = editor.view.coordsAtPos(from);
        const end = editor.view.coordsAtPos(to);
        setPosition({
          left: Math.max(12, (start.left + end.right) / 2),
          top: Math.max(12, Math.min(start.top, end.top) - 48),
        });
      } catch {
        setPosition(null);
      }
    }

    editor.on("selectionUpdate", updatePosition);
    editor.on("transaction", updatePosition);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      editor.off("selectionUpdate", updatePosition);
      editor.off("transaction", updatePosition);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [editor]);

  if (!position) {
    return null;
  }

  function promptForComment() {
    const body = window.prompt("Comment");
    if (body?.trim()) {
      onCreateComment(body.trim());
    }
  }

  return (
    <div
      aria-label="Selection formatting toolbar"
      className="floating-selection-toolbar"
      onMouseDown={(event) => event.preventDefault()}
      role="toolbar"
      style={{
        left: position.left,
        top: position.top,
      }}
    >
      <button
        aria-label="Bold selection"
        className={clsx("icon-button", editor.isActive("bold") && "active")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        type="button"
      >
        <Bold size={16} />
      </button>
      <button
        aria-label="Italic selection"
        className={clsx("icon-button", editor.isActive("italic") && "active")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        type="button"
      >
        <Italic size={16} />
      </button>
      <button
        aria-label="Underline selection"
        className={clsx("icon-button", editor.isActive("underline") && "active")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        type="button"
      >
        <Underline size={16} />
      </button>
      <button
        aria-label="Highlight selection"
        className="icon-button"
        onClick={() => editor.chain().focus().toggleHighlight({ color: "#fff0a8" }).run()}
        type="button"
      >
        <Highlighter size={16} />
      </button>
      <button
        aria-label="Comment on selection"
        className={clsx("icon-button", editor.isActive("inlineComment") && "active")}
        onClick={promptForComment}
        type="button"
      >
        <MessageSquarePlus size={16} />
      </button>
    </div>
  );
}

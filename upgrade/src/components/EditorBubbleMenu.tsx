import { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { Bold, Italic, Underline } from 'lucide-react';

interface EditorBubbleMenuProps {
  editor: Editor;
}

export function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
  if (!editor) {
    return null;
  }

  const ToolbarButton = ({
    onClick,
    isActive,
    children,
  }: {
    onClick: () => void;
    isActive: boolean;
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className={`glass-button p-2 transition-colors mx-0.5 ${
        isActive ? 'active' : 'text-gray-700'
      }`}
    >
      {children}
    </button>
  );

  return (
    <BubbleMenu editor={editor}>
      <div className="glass-toolbar flex items-center p-1.5 shadow-xl">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
        >
          <Underline className="w-4 h-4" />
        </ToolbarButton>
      </div>
    </BubbleMenu>
  );
}

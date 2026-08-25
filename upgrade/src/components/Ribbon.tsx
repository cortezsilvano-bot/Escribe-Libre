import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Image as ImageIcon,
  MessageSquare,
  ChevronDown,
  Highlighter,
  Printer,
  Download,
  Table as TableIcon,
} from 'lucide-react';

interface RibbonProps {
  editor: Editor | null;
  zoom: number;
  setZoom: (zoom: number) => void;
  onDownloadPDF: () => void;
}

export function Ribbon({ editor, zoom, setZoom, onDownloadPDF }: RibbonProps) {
  if (!editor) {
    return <div className="h-20 w-full"></div>;
  }

  const IconButton = ({
    onClick,
    isActive = false,
    disabled = false,
    children,
    label,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    label?: string;
  }) => (
    <div className="flex flex-col items-center justify-center min-w-[40px]">
      <button
        onClick={onClick}
        disabled={disabled}
        title={label}
        aria-label={label}
        className={`glass-button p-2 mx-0.5 flex items-center justify-center ${
          isActive ? 'active' : 'text-gray-700 dark:text-gray-300'
        } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
      >
        {children}
      </button>
      {label && (
        <span className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5 font-medium whitespace-nowrap">
          {label}
        </span>
      )}
    </div>
  );

  const Divider = () => (
    <div className="w-px h-12 bg-gray-300/60 dark:bg-gray-600/60 mx-2 sm:mx-4 self-center shrink-0"></div>
  );

  const setFontFamily = (family: string) => {
    editor.chain().focus().setFontFamily(family).run();
  };

  const selectClass =
    'appearance-none bg-white/40 dark:bg-gray-800/40 border border-white/60 dark:border-gray-700 rounded-lg px-3 py-1 pr-8 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium shadow-sm transition-colors hover:bg-white/60 dark:hover:bg-gray-800/60';

  return (
    <div className="flex items-center h-full w-max min-w-full gap-1">
      {/* Undo / Redo */}
      <div className="flex items-start shrink-0">
        <IconButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          label="Undo"
        >
          <Undo className="w-5 h-5" />
        </IconButton>
        <IconButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          label="Redo"
        >
          <Redo className="w-5 h-5" />
        </IconButton>
      </div>

      <Divider />

      {/* Font & Format */}
      <div className="flex flex-col justify-center space-y-1.5 shrink-0">
        <div className="flex items-center space-x-2 px-1">
          <div className="relative">
            <label htmlFor="font-family" className="sr-only">
              Font family
            </label>
            <select
              id="font-family"
              className={`${selectClass} w-32`}
              onChange={(e) => setFontFamily(e.target.value)}
              value={editor.getAttributes('textStyle').fontFamily || 'sans-serif'}
            >
              <option value="sans-serif">Sans-Serif</option>
              <option value="serif">Serif</option>
              <option value="monospace">Monospace</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 dark:text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center space-x-0.5">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold"
            aria-label="Bold"
            className={`glass-button p-1.5 mx-0.5 ${
              editor.isActive('bold') ? 'active' : 'text-gray-800 dark:text-gray-200'
            }`}
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic"
            aria-label="Italic"
            className={`glass-button p-1.5 mx-0.5 ${
              editor.isActive('italic') ? 'active' : 'text-gray-800 dark:text-gray-200'
            }`}
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline"
            aria-label="Underline"
            className={`glass-button p-1.5 mx-0.5 ${
              editor.isActive('underline') ? 'active' : 'text-gray-800 dark:text-gray-200'
            }`}
          >
            <Underline className="w-4 h-4" />
          </button>

          <div className="relative group flex items-center justify-center mx-1">
            <button
              className="glass-button p-1.5 flex items-center space-x-0.5 text-gray-800 dark:text-gray-200"
              title="Text colour"
              aria-hidden="true"
              tabIndex={-1}
            >
              <span className="font-serif font-bold text-sm leading-none">A</span>
              <ChevronDown className="w-3 h-3 text-gray-500 dark:text-gray-400" />
            </button>
            <input
              type="color"
              aria-label="Text colour"
              title="Text colour"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              value={editor.getAttributes('textStyle').color || '#000000'}
              onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
            />
            <div
              className="absolute bottom-1 left-2 right-4 h-[3px] rounded-full pointer-events-none"
              style={{ backgroundColor: editor.getAttributes('textStyle').color || 'currentColor' }}
            ></div>
          </div>

          <div className="relative group flex items-center justify-center mx-1">
            <button
              className="glass-button p-1.5 flex items-center space-x-0.5 text-gray-800 dark:text-gray-200"
              title="Highlight"
              aria-hidden="true"
              tabIndex={-1}
            >
              <Highlighter className="w-4 h-4" />
              <ChevronDown className="w-3 h-3 text-gray-500 dark:text-gray-400" />
            </button>
            <input
              type="color"
              aria-label="Highlight colour"
              title="Highlight colour"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              onChange={(e) => editor.chain().focus().toggleHighlight({ color: e.target.value }).run()}
            />
            <div className="absolute bottom-1 left-2 right-4 h-[3px] bg-yellow-400 rounded-full pointer-events-none"></div>
          </div>
        </div>
      </div>

      <Divider />

      {/* Alignment */}
      <div className="flex items-center shrink-0">
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          title="Align left"
          aria-label="Align left"
          className={`glass-button p-1.5 mx-0.5 ${
            editor.isActive({ textAlign: 'left' }) ? 'active' : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          <AlignLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          title="Align centre"
          aria-label="Align centre"
          className={`glass-button p-1.5 mx-0.5 ${
            editor.isActive({ textAlign: 'center' }) ? 'active' : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          <AlignCenter className="w-5 h-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          title="Align right"
          aria-label="Align right"
          className={`glass-button p-1.5 mx-0.5 ${
            editor.isActive({ textAlign: 'right' }) ? 'active' : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          <AlignRight className="w-5 h-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          title="Justify"
          aria-label="Justify"
          className={`glass-button p-1.5 mx-0.5 ${
            editor.isActive({ textAlign: 'justify' }) ? 'active' : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          <AlignJustify className="w-5 h-5" />
        </button>
      </div>

      <Divider />

      {/* Lists */}
      <div className="flex items-center shrink-0">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet list"
          aria-label="Bullet list"
          className={`glass-button p-1.5 mx-0.5 ${
            editor.isActive('bulletList') ? 'active' : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          <List className="w-5 h-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered list"
          aria-label="Numbered list"
          className={`glass-button p-1.5 mx-0.5 ${
            editor.isActive('orderedList') ? 'active' : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          <ListOrdered className="w-5 h-5" />
        </button>
      </div>

      <Divider />

      {/* Insert Actions */}
      <div className="flex items-start shrink-0">
        <IconButton
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                  const dataUrl = e.target?.result as string;
                  editor.chain().focus().setImage({ src: dataUrl }).run();
                };
                reader.readAsDataURL(file);
              }
            };
            input.click();
          }}
          label="Insert Image"
        >
          <ImageIcon className="w-5 h-5" />
        </IconButton>
        <IconButton
          onClick={() => {
            const rows = parseInt(window.prompt('Number of rows:', '3') || '0', 10);
            const cols = parseInt(window.prompt('Number of columns:', '3') || '0', 10);
            if (rows > 0 && cols > 0) {
              editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
            }
          }}
          label="Table"
        >
          <TableIcon className="w-5 h-5" />
        </IconButton>
        <IconButton
          onClick={() => {
            if (editor.isActive('comment')) {
              editor.chain().focus().unsetComment().run();
            } else {
              const note = window.prompt('Enter your comment:');
              if (note) {
                editor.chain().focus().setComment(note).run();
              }
            }
          }}
          label="Comment"
        >
          <MessageSquare className="w-5 h-5" />
        </IconButton>
      </div>

      <Divider />

      {/* Right Controls */}
      <div className="flex items-center space-x-3 ml-auto pr-2 shrink-0">
        <div className="relative">
          <label htmlFor="zoom-level" className="sr-only">
            Zoom level
          </label>
          <select
            id="zoom-level"
            className={`${selectClass} rounded-full px-4 py-1.5`}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          >
            <option value={50}>50%</option>
            <option value={75}>75%</option>
            <option value={100}>100%</option>
            <option value={125}>125%</option>
            <option value={150}>150%</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 dark:text-gray-400 pointer-events-none" />
          <div className="flex justify-center w-full mt-1">
            <span className="text-[10px] text-gray-600 dark:text-gray-400 font-medium">Zoom</span>
          </div>
        </div>

        <IconButton onClick={() => window.print()} label="Print">
          <Printer className="w-5 h-5" />
        </IconButton>

        <IconButton onClick={onDownloadPDF} label="PDF">
          <Download className="w-5 h-5" />
        </IconButton>
      </div>
    </div>
  );
}

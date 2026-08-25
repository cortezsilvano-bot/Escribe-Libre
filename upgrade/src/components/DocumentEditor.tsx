import { useState, useEffect, useRef } from 'react';
import { Moon, Sun, CheckCircle2 } from 'lucide-react';
import { EditorContent, useEditor } from '@tiptap/react';
import { Markdown } from 'tiptap-markdown';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import FontFamily from '@tiptap/extension-font-family';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import Image from '@tiptap/extension-image';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import html2pdf from 'html2pdf.js';

import CharacterCount from '@tiptap/extension-character-count';
import Placeholder from '@tiptap/extension-placeholder';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';

import { CommentMark } from './extensions/CommentMark';
import { SpellCheckIndicator } from './extensions/SpellCheck';

import { Ribbon } from './Ribbon';
import { StatusBar } from './StatusBar';
import { EditorBubbleMenu } from './EditorBubbleMenu';

const CONTENT_KEY = 'editor-content';
const TITLE_KEY = 'editor-title';
const THEME_KEY = 'editor-theme';
const UNTITLED = 'Untitled Document';

function readStored(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    // Private mode or blocked site data: continue without persistence.
    return null;
  }
}

function writeStored(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage unavailable or over quota; editing continues regardless.
  }
}

export function DocumentEditor() {
  const [zoom, setZoom] = useState(100);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [documentTitle, setDocumentTitle] = useState(() => readStored(TITLE_KEY) || UNTITLED);
  const [isDarkMode, setIsDarkMode] = useState(() => readStored(THEME_KEY) === 'dark');
  const [showToast, setShowToast] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileMenuRef = useRef<HTMLDivElement | null>(null);

  const editor = useEditor({
    extensions: [
      Markdown,
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      FontFamily,
      Superscript,
      Subscript,
      Image,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      CharacterCount,
      Placeholder.configure({
        placeholder: 'Start typing your document...',
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      CommentMark,
      SpellCheckIndicator,
    ],
    // Starts empty; the Placeholder extension supplies the prompt text.
    content: readStored(CONTENT_KEY) || '',
    onUpdate: ({ editor }) => {
      writeStored(CONTENT_KEY, editor.getHTML());

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      }, 1000);
    },
    editorProps: {
      attributes: {
        // Width tracks the viewport and caps at the 816px US-Letter column,
        // so the page stays fully visible in a narrow window.
        class:
          'document-page prose prose-sm sm:prose-base lg:prose-lg focus:outline-none w-full max-w-[816px] max-sm:min-h-[60vh] sm:min-h-[1056px] dark:prose-invert',
      },
    },
  });

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    writeStored(THEME_KEY, isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    writeStored(TITLE_KEY, documentTitle);
  }, [documentTitle]);

  // Dismiss the File menu on outside click or Escape.
  useEffect(() => {
    if (!showFileMenu) return;

    const onPointerDown = (event: MouseEvent) => {
      if (fileMenuRef.current && !fileMenuRef.current.contains(event.target as Node)) {
        setShowFileMenu(false);
      }
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowFileMenu(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onEscape);
    };
  }, [showFileMenu]);

  const exportToFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const safeFilename = (extension: string) => {
    const base = documentTitle.trim().replace(/[^\w\-. ]+/g, '').trim() || 'document';
    return base + '.' + extension;
  };

  const handleExportHTML = () => {
    if (!editor) return;
    exportToFile(editor.getHTML(), safeFilename('html'), 'text/html');
    setShowFileMenu(false);
  };

  const handleExportTXT = () => {
    if (!editor) return;
    exportToFile(editor.getText(), safeFilename('txt'), 'text/plain');
    setShowFileMenu(false);
  };

  const handleExportPDF = () => {
    if (!editor) return;

    // Render to a detached div so the export carries document styling rather
    // than the surrounding app shell.
    const element = document.createElement('div');
    element.innerHTML = editor.getHTML();

    element.style.padding = '40px';
    element.style.fontFamily = 'Inter, Arial, sans-serif';
    element.style.lineHeight = '1.6';
    element.style.color = '#000';

    const opt = {
      margin: 0.5,
      filename: safeFilename('pdf'),
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const },
    };

    html2pdf().set(opt).from(element).save();
    setShowFileMenu(false);
  };

  const handleExportDOCX = () => {
    if (!editor) return;
    const header =
      "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Document</title></head><body>";
    const footer = '</body></html>';
    const sourceHTML = header + editor.getHTML() + footer;
    exportToFile(sourceHTML, safeFilename('doc'), 'application/msword');
    setShowFileMenu(false);
  };

  const handleNewDocument = () => {
    if (!editor) return;

    if (
      !editor.isEmpty &&
      !window.confirm('Create a new blank document? This will clear the current document.')
    ) {
      setShowFileMenu(false);
      return;
    }

    editor.commands.setContent('<p></p>');
    writeStored(CONTENT_KEY, '<p></p>');
    setDocumentTitle(UNTITLED);
    setShowFileMenu(false);
    editor.commands.focus('start');
  };

  useEffect(() => {
    const handleKeyboardShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'n') {
        event.preventDefault();
        handleNewDocument();
      }
    };

    window.addEventListener('keydown', handleKeyboardShortcut);
    return () => window.removeEventListener('keydown', handleKeyboardShortcut);
  }, [editor]);

  const menuItemClass =
    'block w-full text-left px-4 py-2 hover:bg-white/50 dark:hover:bg-gray-700/50 text-sm';

  return (
    <div
      className={
        'glass-bg min-h-screen w-full flex flex-col items-center p-2 sm:p-4 lg:p-8 relative font-sans ' +
        (isDarkMode ? 'dark' : '')
      }
    >
      {/* Top Glass Panel */}
      <div className="glass-panel w-full max-w-[1000px] rounded-2xl flex flex-col mb-4 z-10 shrink-0 print:hidden relative dark:bg-gray-900/60 dark:border-gray-700">
        {/* Glow effect for realism */}
        <div className="absolute top-0 left-[20%] w-32 h-1 bg-white blur-sm opacity-50 rounded-full"></div>
        <div className="absolute top-0 right-[20%] w-32 h-1 bg-white blur-sm opacity-50 rounded-full"></div>

        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 px-4 sm:px-6 pt-4 sm:pt-5 pb-3">
          <div className="flex flex-col min-w-0 flex-1">
            <label htmlFor="document-title" className="sr-only">
              Document title
            </label>
            <input
              id="document-title"
              value={documentTitle}
              onChange={(event) => setDocumentTitle(event.target.value)}
              onBlur={() => {
                if (!documentTitle.trim()) setDocumentTitle(UNTITLED);
              }}
              spellCheck={false}
              className="font-semibold text-gray-900 dark:text-gray-100 text-base sm:text-lg bg-transparent border border-transparent hover:border-white/60 focus:border-white/80 dark:hover:border-gray-600 dark:focus:border-gray-500 rounded-md px-1.5 py-0.5 -ml-1.5 w-full sm:max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-400/60 transition-colors"
            />
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-700 dark:text-gray-300 mt-2 font-medium">
              <div className="relative" ref={fileMenuRef}>
                <button
                  className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  aria-haspopup="menu"
                  aria-expanded={showFileMenu}
                  onClick={() => setShowFileMenu(!showFileMenu)}
                >
                  File
                </button>
                {showFileMenu && (
                  <div
                    role="menu"
                    className="absolute top-full left-0 mt-2 w-48 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-lg shadow-xl py-1 text-gray-800 dark:text-gray-200 z-50 border border-white/50 dark:border-gray-700"
                  >
                    <button
                      role="menuitem"
                      onClick={handleNewDocument}
                      className="flex w-full items-center justify-between px-4 py-2 hover:bg-white/50 dark:hover:bg-gray-700/50 text-sm"
                    >
                      <span>New Document</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Ctrl+N</span>
                    </button>
                    <div className="my-1 border-t border-gray-300/60 dark:border-gray-600/60" />
                    <button role="menuitem" onClick={handleExportTXT} className={menuItemClass}>
                      Export as .txt
                    </button>
                    <button role="menuitem" onClick={handleExportHTML} className={menuItemClass}>
                      Export as .html
                    </button>
                    <button role="menuitem" onClick={handleExportPDF} className={menuItemClass}>
                      Download PDF
                    </button>
                    <button role="menuitem" onClick={handleExportDOCX} className={menuItemClass}>
                      Export as .docx
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 bg-white/30 dark:bg-gray-800/30 border border-white/50 dark:border-gray-700 rounded-full shadow-sm hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors"
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-gray-200" />
              ) : (
                <Moon className="w-4 h-4 text-gray-800" />
              )}
            </button>
          </div>
        </div>

        {/* Ribbon section */}
        <div className="px-2 sm:px-4 pb-4">
          <div className="glass-toolbar w-full flex items-center p-2 overflow-x-auto custom-scrollbar">
            <Ribbon editor={editor} zoom={zoom} setZoom={setZoom} onDownloadPDF={handleExportPDF} />
          </div>
        </div>
      </div>

      {/* Editor Canvas Container */}
      <div className="glass-panel w-full max-w-[1000px] rounded-t-2xl flex-grow overflow-hidden relative z-0 flex flex-col border-b-0 shadow-none bg-white/10">
        <div className="flex-grow overflow-auto p-2 sm:p-4 lg:p-8 relative flex justify-center custom-scrollbar">
          <div
            className="origin-top flex justify-center pb-20 w-full"
            style={{ transform: 'scale(' + zoom / 100 + ')', transition: 'transform 0.2s ease-in-out' }}
          >
            {editor && <EditorBubbleMenu editor={editor} />}
            <EditorContent editor={editor} className="outline-none w-full flex justify-center" />
          </div>
        </div>
        <StatusBar editor={editor} zoom={zoom} setZoom={setZoom} />
      </div>

      {/* Toast Notification */}
      <div
        role="status"
        aria-live="polite"
        className={
          'fixed bottom-4 right-4 sm:bottom-8 sm:right-8 bg-gray-900/90 text-white px-4 py-2.5 rounded-lg shadow-xl flex items-center space-x-2 transition-all duration-300 transform ' +
          (showToast ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none')
        }
      >
        <CheckCircle2 className="w-4 h-4 text-green-400" />
        <span className="text-sm font-medium">Saved to local storage</span>
      </div>
    </div>
  );
}

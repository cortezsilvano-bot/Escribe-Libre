import { useState, useEffect, useRef } from 'react';
import { Star, ChevronDown, UserPlus, Moon, Sun, CheckCircle2 } from 'lucide-react';
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

const defaultContent = `
  <h1 style="text-align: center">Project Proposal</h1>
  <p>This is a professional web-based text editor built on top of Tiptap and ProseMirror.</p>
  <p>Features include:</p>
  <ul>
    <li>Rich text formatting (<strong>bold</strong>, <em>italic</em>, <u>underline</u>, <s>strikethrough</s>)</li>
    <li>Advanced typography (<sup>superscript</sup>, <sub>subscript</sub>, <span style="color: #ff0000">colored text</span>, <mark style="background-color: #ffff00">highlights</mark>)</li>
    <li>Paragraph alignment</li>
    <li>Lists and structured data</li>
  </ul>
  <p style="text-align: right">Try editing this document to explore the features.</p>
`;

export function DocumentEditor() {
  const [zoom, setZoom] = useState(100);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [documentTitle, setDocumentTitle] = useState('Project Proposal - Q4 Market Strategy');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const savedContent = typeof window !== 'undefined' ? localStorage.getItem('editor-content') : null;

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
    content: savedContent || defaultContent,
    onUpdate: ({ editor }) => {
      localStorage.setItem('editor-content', editor.getHTML());
      
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
        class: 'document-page prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl focus:outline-none min-h-[1056px] w-[816px] max-w-none dark:prose-invert',
      },
    },
  });

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

  const handleExportHTML = () => {
    if (!editor) return;
    exportToFile(editor.getHTML(), 'document.html', 'text/html');
    setShowFileMenu(false);
  };

  const handleExportTXT = () => {
    if (!editor) return;
    exportToFile(editor.getText(), 'document.txt', 'text/plain');
    setShowFileMenu(false);
  };

  const handleExportPDF = () => {
    if (!editor) return;
    
    // We render the content to a temporary div to apply standard prose styling 
    // for the export without rendering the whole app shell
    const element = document.createElement('div');
    element.innerHTML = editor.getHTML();
    
    // Some inline basic styling to make it look decent
    element.style.padding = '40px';
    element.style.fontFamily = 'Inter, Arial, sans-serif';
    element.style.lineHeight = '1.6';
    element.style.color = '#000';
    
    const opt = {
      margin:       0.5,
      filename:     'document.pdf',
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' as const }
    };
    
    html2pdf().set(opt).from(element).save();
    setShowFileMenu(false);
  };

  const handleExportDOCX = () => {
    if (!editor) return;
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Document</title></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + editor.getHTML() + footer;
    exportToFile(sourceHTML, 'document.doc', 'application/msword');
    setShowFileMenu(false);
  };

  const handleNewDocument = () => {
    if (!editor) return;

    if (!editor.isEmpty && !window.confirm('Create a new blank document? This will clear the current document.')) {
      setShowFileMenu(false);
      return;
    }

    editor.commands.setContent('<p></p>');
    localStorage.setItem('editor-content', '<p></p>');
    setDocumentTitle('Untitled Document');
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
  });

  return (
    <div className={`glass-bg min-h-screen w-full flex flex-col items-center p-8 overflow-hidden relative font-sans ${isDarkMode ? 'dark' : ''}`}>
      
      {/* Top Glass Panel */}
      <div className="glass-panel w-full max-w-[1000px] rounded-2xl flex flex-col mb-4 z-10 shrink-0 print:hidden relative dark:bg-gray-900/60 dark:border-gray-700">
        {/* Glow effect for realism */}
        <div className="absolute top-0 left-[20%] w-32 h-1 bg-white blur-sm opacity-50 rounded-full"></div>
        <div className="absolute top-0 right-[20%] w-32 h-1 bg-white blur-sm opacity-50 rounded-full"></div>
        
        {/* Header section */}
        <div className="flex items-start justify-between px-6 pt-5 pb-3">
          <div className="flex flex-col">
             <div className="flex items-center space-x-2">
               <span className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{documentTitle}</span>
               <Star className="w-4 h-4 text-gray-600 dark:text-gray-400" />
             </div>
             <div className="flex space-x-4 text-sm text-gray-700 dark:text-gray-300 mt-2 font-medium">
               <div className="relative">
                 <button className="hover:text-gray-900 dark:hover:text-white transition-colors" onClick={() => setShowFileMenu(!showFileMenu)}>File</button>
                 {showFileMenu && (
                   <div className="absolute top-full left-0 mt-2 w-48 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg shadow-xl py-1 text-gray-800 dark:text-gray-200 z-50 border border-white/50 dark:border-gray-700">
                     <button onClick={handleNewDocument} className="flex w-full items-center justify-between px-4 py-2 hover:bg-white/50 dark:hover:bg-gray-700/50 text-sm"><span>New Document</span><span className="text-xs text-gray-500 dark:text-gray-400">Ctrl+N</span></button>
                     <div className="my-1 border-t border-gray-300/60 dark:border-gray-600/60" />
                     <button onClick={handleExportTXT} className="block w-full text-left px-4 py-2 hover:bg-white/50 dark:hover:bg-gray-700/50 text-sm">Export as .txt</button>
                     <button onClick={handleExportHTML} className="block w-full text-left px-4 py-2 hover:bg-white/50 dark:hover:bg-gray-700/50 text-sm">Export as .html</button>
                     <button onClick={handleExportPDF} className="block w-full text-left px-4 py-2 hover:bg-white/50 dark:hover:bg-gray-700/50 text-sm">Download PDF</button>
                     <button onClick={handleExportDOCX} className="block w-full text-left px-4 py-2 hover:bg-white/50 dark:hover:bg-gray-700/50 text-sm">Export as .docx</button>
                   </div>
                 )}
               </div>
               <button className="hover:text-gray-900 dark:hover:text-white transition-colors">Edit</button>
               <button className="hover:text-gray-900 dark:hover:text-white transition-colors">View</button>
               <button className="text-blue-700 dark:text-blue-400 font-semibold relative">
                 Insert
                 <div className="absolute -bottom-1 left-0 right-0 h-[2px] bg-blue-500 rounded-full blur-[1px]"></div>
                 <div className="absolute -bottom-1 left-0 right-0 h-[2px] bg-blue-500 rounded-full"></div>
               </button>
               <button className="hover:text-gray-900 dark:hover:text-white transition-colors">Format</button>
               <button className="hover:text-gray-900 dark:hover:text-white transition-colors">Tools</button>
               <button className="hover:text-gray-900 dark:hover:text-white transition-colors">Extensions</button>
               <button className="hover:text-gray-900 dark:hover:text-white transition-colors flex items-center">Help <ChevronDown className="w-3 h-3 ml-1" /></button>
             </div>
          </div>
          
          <div className="flex items-center space-x-4 pt-1">
             <button 
               onClick={() => setIsDarkMode(!isDarkMode)}
               className="p-1.5 bg-white/30 dark:bg-gray-800/30 border border-white/50 dark:border-gray-700 rounded-full shadow-sm hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors"
               title="Toggle Theme"
             >
               {isDarkMode ? <Sun className="w-4 h-4 text-gray-200" /> : <Moon className="w-4 h-4 text-gray-800" />}
             </button>
             <button className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/30 dark:bg-gray-800/30 border border-white/50 dark:border-gray-700 rounded-full shadow-sm hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors">
               <UserPlus className="w-4 h-4 text-gray-800 dark:text-gray-200" />
               <span className="text-gray-900 dark:text-gray-100 font-medium text-sm">Share</span>
             </button>
             <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm shrink-0 bg-gray-200">
                <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="User Avatar" className="w-full h-full object-cover" />
             </div>
          </div>
        </div>
        
        {/* Ribbon section */}
        <div className="px-4 pb-4">
          <div className="glass-toolbar w-full flex items-center p-2 overflow-x-auto">
            <Ribbon editor={editor} zoom={zoom} setZoom={setZoom} onDownloadPDF={handleExportPDF} />
          </div>
        </div>
      </div>

      {/* Editor Canvas Container */}
      <div className="glass-panel w-full max-w-[1000px] rounded-t-2xl flex-grow overflow-hidden relative z-0 flex flex-col border-b-0 shadow-none bg-white/10">
        <div className="flex-grow overflow-auto p-8 relative flex justify-center custom-scrollbar">
          <div 
            className="origin-top flex justify-center pb-20 w-full"
            style={{ transform: `scale(${zoom / 100})`, transition: 'transform 0.2s ease-in-out' }}
          >
            {editor && <EditorBubbleMenu editor={editor} />}
            <EditorContent editor={editor} className="outline-none shrink-0" />
          </div>
        </div>
      </div>
      
      {/* Toast Notification */}
      <div className={`fixed bottom-8 right-8 bg-gray-900/90 text-white px-4 py-2.5 rounded-lg shadow-xl flex items-center space-x-2 transition-all duration-300 transform ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
        <CheckCircle2 className="w-4 h-4 text-green-400" />
        <span className="text-sm font-medium">Saved to local storage</span>
      </div>
    </div>
  );
}

"use client";

import type { Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  Download,
  Highlighter,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  MessageSquare,
  PanelLeft,
  PanelRight,
  Printer,
  Redo2,
  Table,
  Underline,
  Undo2,
} from "lucide-react";
import clsx from "clsx";
import type { PageSettings } from "@/lib/documents/document-model";

export type PasteMode = "keep" | "match" | "plain";

type EditorRibbonProps = {
  characterCount: number;
  editor: Editor;
  leftPanelOpen: boolean;
  onCreateComment: (body: string) => void;
  onDownloadPdf: () => void;
  onToggleLeftPanel: () => void;
  onToggleRightPanel: () => void;
  pageSettings: PageSettings;
  pasteMode: PasteMode;
  rightPanelOpen: boolean;
  setPageSettings: (settings: PageSettings) => void;
  setPasteMode: (mode: PasteMode) => void;
  wordCount: number;
};

type ToolbarButtonProps = {
  active?: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
};

function ToolbarButton({ active, children, disabled, label, onClick }: ToolbarButtonProps) {
  return (
    <button
      aria-label={label}
      className={clsx("upgrade-tool-button", active && "active")}
      disabled={disabled}
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
      <span>{label}</span>
    </button>
  );
}

function ToolbarDivider() {
  return <div className="upgrade-toolbar-divider" />;
}

export function EditorRibbon({
  characterCount,
  editor,
  leftPanelOpen,
  onCreateComment,
  onDownloadPdf,
  onToggleLeftPanel,
  onToggleRightPanel,
  pageSettings,
  pasteMode,
  rightPanelOpen,
  setPageSettings,
  setPasteMode,
  wordCount,
}: EditorRibbonProps) {
  function setLink() {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previousUrl ?? "https://");
    if (url === null) {
      return;
    }
    if (url.trim() === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  function setImage() {
    const url = window.prompt("Image URL");
    if (!url?.trim()) {
      return;
    }
    editor.chain().focus().setImage({ src: url.trim(), alt: "" }).run();
  }

  function addComment() {
    const body = window.prompt("Comment");
    if (body?.trim()) {
      onCreateComment(body.trim());
    }
  }

  function setZoom(nextZoom: number) {
    setPageSettings({
      ...pageSettings,
      zoom: Math.min(2, Math.max(0.5, Number(nextZoom.toFixed(2)))),
    });
  }

  return (
    <nav aria-label="Editor ribbon" className="ribbon upgrade-ribbon">
      <div className="upgrade-toolbar" role="toolbar">
        <div className="upgrade-toolbar-stack history-stack">
          <div className="upgrade-row">
            <ToolbarButton disabled={!editor.can().undo()} label="Undo" onClick={() => editor.chain().focus().undo().run()}>
              <Undo2 size={19} />
            </ToolbarButton>
            <ToolbarButton disabled={!editor.can().redo()} label="Redo" onClick={() => editor.chain().focus().redo().run()}>
              <Redo2 size={19} />
            </ToolbarButton>
          </div>
        </div>

        <ToolbarDivider />

        <div className="upgrade-toolbar-stack type-stack">
          <div className="upgrade-row">
            <label className="upgrade-select-wrap">
              <select
                aria-label="Font family"
                defaultValue=""
                onChange={(event) => editor.chain().focus().setFontFamily(event.target.value).run()}
              >
                <option value="">Sans-Serif</option>
                <option value="Arial">Arial</option>
                <option value="Georgia">Georgia</option>
                <option value="Inter">Inter</option>
                <option value="Times New Roman">Times</option>
              </select>
              <ChevronDown size={16} />
            </label>
            <label className="upgrade-select-wrap small">
              <select
                aria-label="Font size"
                defaultValue=""
                onChange={(event) => editor.chain().focus().setFontSize(event.target.value).run()}
              >
                <option value="">12</option>
                {["10px", "11px", "12px", "14px", "16px", "18px", "24px"].map((size) => (
                  <option key={size} value={size}>{size.replace("px", "")}</option>
                ))}
              </select>
              <ChevronDown size={16} />
            </label>
          </div>
          <div className="upgrade-row">
            <button aria-label="Bold" className={clsx("upgrade-icon", editor.isActive("bold") && "active")} onClick={() => editor.chain().focus().toggleBold().run()} type="button">
              <Bold size={18} />
            </button>
            <button aria-label="Italic" className={clsx("upgrade-icon", editor.isActive("italic") && "active")} onClick={() => editor.chain().focus().toggleItalic().run()} type="button">
              <Italic size={18} />
            </button>
            <button aria-label="Underline" className={clsx("upgrade-icon", editor.isActive("underline") && "active")} onClick={() => editor.chain().focus().toggleUnderline().run()} type="button">
              <Underline size={18} />
            </button>
            <button aria-label="Text color" className="upgrade-icon text-color-tool" onClick={() => editor.chain().focus().setColor("#111827").run()} type="button">
              <span>A</span>
              <ChevronDown size={13} />
            </button>
            <button aria-label="Highlight" className="upgrade-icon highlight-tool" onClick={() => editor.chain().focus().toggleHighlight({ color: "#fff200" }).run()} type="button">
              <Highlighter size={18} />
              <ChevronDown size={13} />
            </button>
          </div>
        </div>

        <ToolbarDivider />

        <div className="upgrade-toolbar-stack align-stack">
          <div className="upgrade-row">
            {[
              ["left", AlignLeft],
              ["center", AlignCenter],
              ["right", AlignRight],
              ["justify", AlignJustify],
            ].map(([align, Icon]) => (
              <button
                aria-label={`Align ${align}`}
                className={clsx("upgrade-icon", editor.isActive({ textAlign: align }) && "active")}
                key={align as string}
                onClick={() => editor.chain().focus().setTextAlign(align as string).run()}
                type="button"
              >
                <Icon size={20} />
              </button>
            ))}
          </div>
          <span className="upgrade-caption">Line Spacing</span>
        </div>

        <ToolbarDivider />

        <div className="upgrade-toolbar-stack list-stack">
          <div className="upgrade-row">
            <button aria-label="Bullet list" className={clsx("upgrade-icon", editor.isActive("bulletList") && "active")} onClick={() => editor.chain().focus().toggleBulletList().run()} type="button">
              <List size={20} />
            </button>
            <button aria-label="Numbered list" className={clsx("upgrade-icon", editor.isActive("orderedList") && "active")} onClick={() => editor.chain().focus().toggleOrderedList().run()} type="button">
              <ListOrdered size={20} />
            </button>
          </div>
          <div className="upgrade-row muted-row">
            <button aria-label="Outline" className={clsx("upgrade-icon", leftPanelOpen && "active")} onClick={onToggleLeftPanel} type="button">
              <PanelLeft size={18} />
            </button>
            <button aria-label="Inspector" className={clsx("upgrade-icon", rightPanelOpen && "active")} onClick={onToggleRightPanel} type="button">
              <PanelRight size={18} />
            </button>
          </div>
        </div>

        <ToolbarDivider />

        <div className="upgrade-toolbar-stack insert-stack">
          <div className="upgrade-row">
            <ToolbarButton label="Insert Image" onClick={setImage}>
              <ImageIcon size={20} />
            </ToolbarButton>
            <ToolbarButton label="Table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
              <Table size={20} />
            </ToolbarButton>
            <ToolbarButton label="Link" onClick={setLink}>
              <LinkIcon size={20} />
            </ToolbarButton>
            <ToolbarButton label="Comment" onClick={addComment}>
              <MessageSquare size={20} />
            </ToolbarButton>
          </div>
        </div>

        <ToolbarDivider />

        <div className="upgrade-toolbar-stack right-stack">
          <label className="sr-only">
            Paste mode
            <select
              aria-label="Paste mode"
              onChange={(event) => setPasteMode(event.target.value as PasteMode)}
              value={pasteMode}
            >
              <option value="keep">Keep formatting</option>
              <option value="match">Match document</option>
              <option value="plain">Plain text</option>
            </select>
          </label>
          <div className="upgrade-row">
            <button className="editing-pill" type="button">
              Editing
              <ChevronDown size={15} />
            </button>
          </div>
          <div className="upgrade-row compact-meta">
            <button aria-label="Print" className="upgrade-icon" onClick={() => window.print()} type="button">
              <Printer size={18} />
            </button>
            <button aria-label="Download PDF" className="upgrade-icon" onClick={onDownloadPdf} type="button">
              <Download size={18} />
            </button>
            <label aria-label="Zoom" className="upgrade-zoom">
              <select onChange={(event) => setZoom(Number(event.target.value) / 100)} value={Math.round(pageSettings.zoom * 100)}>
                <option value={50}>50%</option>
                <option value={75}>75%</option>
                <option value={100}>100%</option>
                <option value={125}>125%</option>
                <option value={150}>150%</option>
              </select>
            </label>
            <span>{wordCount.toLocaleString()}w</span>
            <span>{characterCount.toLocaleString()}c</span>
          </div>
        </div>
      </div>
    </nav>
  );
}

"use client";

import { EditorContent, useEditor, type JSONContent } from "@tiptap/react";
import DOMPurify from "dompurify";
import {
  ArrowLeft,
  ChevronDown,
  CircleUserRound,
  Download,
  FileInput,
  FileText,
  Moon,
  PanelLeft,
  PanelRight,
  Save,
  Star,
  Sun,
  UserPlus,
} from "lucide-react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  DocumentComment,
  DocumentRecord,
  DocumentVersion,
  PageSettings,
} from "@/lib/documents/document-model";
import { defaultEditorContent, defaultPageSettings } from "@/lib/documents/document-model";
import {
  createDocumentComment,
  createDocumentVersion,
  deleteDocumentComment,
  deleteDocumentVersion,
  ensureDocument,
  listDocumentComments,
  listDocumentVersions,
  saveDocument,
  updateDocumentComment,
} from "@/lib/documents/document-store";
import { downloadTextdocFile } from "@/lib/documents/textdoc-file";
import { getCharacterCountFromJson, getWordCountFromJson } from "@/lib/editor/text-index";
import { getEditorExtensions } from "@/lib/editor/editor-extensions";
import { createDocxBlob } from "@/lib/export/docx-export";
import { downloadBlob, safeFileStem } from "@/lib/export/file-download";
import { getPageDimensions, getPageStyle } from "@/lib/pagination/page-settings";
import { applyTheme, getLocalSettings, saveLocalSettings, type LocalSettings } from "@/lib/settings/local-settings";
import { EditorRibbon, type PasteMode } from "./EditorRibbon";
import { EditorSidebar } from "./EditorSidebar";
import { FloatingSelectionToolbar } from "./FloatingSelectionToolbar";
import { StatusBar } from "./StatusBar";

type SaveState = "idle" | "saving" | "saved" | "error";
type ToastTone = "info" | "success" | "error";

type DocumentEditorProps = {
  documentId: string;
};

const forbiddenPasteTags = ["script", "iframe", "object", "embed"];

function sanitizePastedHtml(html: string) {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: forbiddenPasteTags,
  });
}

function unwrapElement(element: Element) {
  const parent = element.parentNode;
  if (!parent) {
    return;
  }

  while (element.firstChild) {
    parent.insertBefore(element.firstChild, element);
  }
  parent.removeChild(element);
}

function stripSourceFormatting(html: string) {
  const safeHtml = sanitizePastedHtml(html);
  if (typeof DOMParser === "undefined") {
    return safeHtml;
  }

  const parsed = new DOMParser().parseFromString(safeHtml, "text/html");
  parsed.body.querySelectorAll("[style], [class], [color], [face], [size]").forEach((element) => {
    element.removeAttribute("style");
    element.removeAttribute("class");
    element.removeAttribute("color");
    element.removeAttribute("face");
    element.removeAttribute("size");
  });
  parsed.body.querySelectorAll("span, font").forEach(unwrapElement);

  return parsed.body.innerHTML;
}

export function DocumentEditor({ documentId }: DocumentEditorProps) {
  const router = useRouter();
  const [record, setRecord] = useState<DocumentRecord | null>(null);
  const [title, setTitle] = useState("Untitled document");
  const [pageSettings, setPageSettings] = useState<PageSettings>(defaultPageSettings);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [comments, setComments] = useState<DocumentComment[]>([]);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: ToastTone } | null>(null);
  const [editorFont, setEditorFont] = useState("Inter");
  const [pasteMode, setPasteMode] = useState<PasteMode>("keep");
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [theme, setTheme] = useState<LocalSettings["theme"]>("neon-dark");
  const htmlInputRef = useRef<HTMLInputElement>(null);
  const docxInputRef = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<number | null>(null);
  const autosaveDelay = useRef(600);
  const hasPendingSave = useRef(false);
  const recordRef = useRef<DocumentRecord | null>(null);
  const titleRef = useRef(title);
  const pageSettingsRef = useRef(pageSettings);
  const pasteModeRef = useRef<PasteMode>(pasteMode);

  const showToast = useCallback((message: string, tone: ToastTone = "info") => {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 2800);
  }, []);

  const scheduleSave = useCallback((nextRecord: DocumentRecord) => {
    if (saveTimer.current) {
      window.clearTimeout(saveTimer.current);
    }

    hasPendingSave.current = true;
    setSaveState("saving");
    saveTimer.current = window.setTimeout(async () => {
      try {
        const saved = await saveDocument(nextRecord);
        hasPendingSave.current = false;
        recordRef.current = saved;
        setRecord(saved);
        setSaveState("saved");
      } catch (saveError) {
        setSaveState("error");
        setError(saveError instanceof Error ? saveError.message : "Could not save document.");
      }
    }, autosaveDelay.current);
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: getEditorExtensions(),
    content: defaultEditorContent,
    editorProps: {
      attributes: {
        class: "prose-editor",
        spellcheck: "true",
      },
      transformPastedHTML(html) {
        return pasteModeRef.current === "match" ? stripSourceFormatting(html) : sanitizePastedHtml(html);
      },
      handlePaste(view, event) {
        if (pasteModeRef.current !== "plain") {
          return false;
        }

        const clipboardText = event.clipboardData?.getData("text/plain");
        if (!clipboardText) {
          return false;
        }

        event.preventDefault();
        const normalizedText = clipboardText.replace(/\r\n?/g, "\n");
        const transaction = view.state.tr.insertText(
          normalizedText,
          view.state.selection.from,
          view.state.selection.to,
        );
        view.dispatch(transaction.scrollIntoView());
        return true;
      },
    },
    onUpdate({ editor: activeEditor }) {
      const currentRecord = recordRef.current;
      if (!currentRecord) {
        return;
      }
      setWordCount(getWordCountFromJson(activeEditor.getJSON()));
      setCharacterCount(getCharacterCountFromJson(activeEditor.getJSON()));
      scheduleSave({
        ...currentRecord,
        title: titleRef.current,
        content: activeEditor.getJSON(),
        pageSettings: pageSettingsRef.current,
      });
    },
  });

  const pageDimensions = getPageDimensions(pageSettings);

  const refreshVersions = useCallback(async () => {
    setVersions(await listDocumentVersions(documentId));
  }, [documentId]);

  const refreshComments = useCallback(async () => {
    setComments(await listDocumentComments(documentId));
  }, [documentId]);

  useEffect(() => {
    recordRef.current = record;
  }, [record]);

  useEffect(() => {
    titleRef.current = title;
  }, [title]);

  useEffect(() => {
    pageSettingsRef.current = pageSettings;
  }, [pageSettings]);

  useEffect(() => {
    pasteModeRef.current = pasteMode;
  }, [pasteMode]);

  useEffect(() => {
    let mounted = true;

    async function loadDocument() {
      try {
        const localSettings = getLocalSettings();
        autosaveDelay.current = localSettings.autosaveDelayMs;
        setEditorFont(localSettings.defaultFont);
        setTheme(localSettings.theme);
        applyTheme(localSettings.theme);
        const loaded = await ensureDocument(documentId);
        if (!mounted) {
          return;
        }
        setRecord(loaded);
        recordRef.current = loaded;
        setTitle(loaded.title);
        titleRef.current = loaded.title;
        setPageSettings(loaded.pageSettings);
        pageSettingsRef.current = loaded.pageSettings;
        editor?.commands.setContent(loaded.content as JSONContent);
        setWordCount(getWordCountFromJson(loaded.content));
        setCharacterCount(getCharacterCountFromJson(loaded.content));
        await refreshVersions();
        await refreshComments();
        hasPendingSave.current = false;
        setSaveState("saved");
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load document.");
      }
    }

    if (editor) {
      void loadDocument();
    }

    return () => {
      mounted = false;
    };
  }, [documentId, editor, refreshComments, refreshVersions]);

  function exportHtml() {
    if (!editor) {
      return;
    }

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title></head><body>${editor.getHTML()}</body></html>`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    downloadBlob(blob, `${safeFileStem(title)}.html`);
    showToast("HTML exported.", "success");
  }

  function exportText() {
    if (!editor) {
      return;
    }

    const blob = new Blob([editor.getText()], { type: "text/plain;charset=utf-8" });
    downloadBlob(blob, `${safeFileStem(title)}.txt`);
    showToast("TXT exported.", "success");
  }

  function toggleTheme() {
    const nextTheme: LocalSettings["theme"] = theme === "neon-dark" ? "light" : "neon-dark";
    const currentSettings = getLocalSettings();
    saveLocalSettings({ ...currentSettings, theme: nextTheme });
    setTheme(nextTheme);
  }

  async function exportTextdoc() {
    const currentRecord = recordRef.current;
    if (!currentRecord || !editor) {
      return;
    }

    const latestRecord = await saveDocument({
      ...currentRecord,
      title: titleRef.current,
      content: editor.getJSON(),
      pageSettings: pageSettingsRef.current,
    });
    recordRef.current = latestRecord;
    setRecord(latestRecord);
    hasPendingSave.current = false;
    setSaveState("saved");
    downloadTextdocFile(latestRecord);
    showToast(".textdoc saved.", "success");
  }

  async function exportDocx() {
    try {
      if (!editor) {
        return;
      }

      const blob = await createDocxBlob({
        content: editor.getJSON(),
        pageSettings,
        title,
      });
      downloadBlob(blob, `${safeFileStem(title)}.docx`);
      showToast("DOCX exported.", "success");
    } catch (docxError) {
      showToast(docxError instanceof Error ? docxError.message : "Could not export DOCX.", "error");
    }
  }

  async function importHtml(file: File) {
    try {
      if (!editor) {
        return;
      }

      const html = await file.text();
      const safeHtml = DOMPurify.sanitize(html, {
        USE_PROFILES: { html: true },
        FORBID_TAGS: ["script", "iframe", "object", "embed"],
      });
      editor.commands.setContent(safeHtml);
      showToast("HTML imported.", "success");
    } catch (importError) {
      showToast(importError instanceof Error ? importError.message : "Could not import HTML.", "error");
    }
  }

  async function importDocx(file: File) {
    if (!editor) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/import/docx", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      showToast(payload?.error ?? "Could not import DOCX file.", "error");
      return;
    }

    const payload = (await response.json()) as { html: string; warnings: string[] };
    editor.commands.setContent(payload.html);
    showToast(payload.warnings.length ? payload.warnings.join(" ") : "DOCX imported.", "success");
  }

  function printDocument() {
    window.open(`/documents/${documentId}/print`, "_blank", "noopener,noreferrer");
  }

  function canLeaveDocument() {
    return !hasPendingSave.current && saveState !== "saving" && saveState !== "error";
  }

  function goBackToDashboard() {
    if (!canLeaveDocument()) {
      const shouldLeave = window.confirm("This document is still saving or has a save error. Leave anyway?");
      if (!shouldLeave) {
        return;
      }
    }

    router.push("/");
  }

  function commitTitle(nextTitle: string) {
    const safeTitle = nextTitle || "Untitled document";
    setTitle(safeTitle);
    titleRef.current = safeTitle;

    const currentRecord = recordRef.current;
    if (currentRecord && editor) {
      scheduleSave({
        ...currentRecord,
        title: safeTitle,
        content: editor.getJSON(),
        pageSettings: pageSettingsRef.current,
      });
    }
  }

  function commitPageSettings(nextSettings: PageSettings) {
    setPageSettings(nextSettings);
    pageSettingsRef.current = nextSettings;

    const currentRecord = recordRef.current;
    if (currentRecord && editor) {
      scheduleSave({
        ...currentRecord,
        title: titleRef.current,
        content: editor.getJSON(),
        pageSettings: nextSettings,
      });
    }
  }

  async function handleCreateVersion(label?: string) {
    const currentRecord = recordRef.current;
    if (!currentRecord || !editor) {
      return;
    }

    const latestRecord = await saveDocument({
      ...currentRecord,
      title: titleRef.current,
      content: editor.getJSON(),
      pageSettings: pageSettingsRef.current,
    });
    recordRef.current = latestRecord;
    setRecord(latestRecord);
    hasPendingSave.current = false;
    await createDocumentVersion(latestRecord, label || `Snapshot ${versions.length + 1}`);
    await refreshVersions();
    setSaveState("saved");
    showToast("Version snapshot saved.", "success");
  }

  async function handleRestoreVersion(version: DocumentVersion) {
    if (!editor) {
      return;
    }

    const shouldRestore = window.confirm(
      `Restore "${version.label}"? Current unsaved edits will be replaced by that snapshot.`,
    );
    if (!shouldRestore) {
      return;
    }

    const restored = await saveDocument({
      id: version.documentId,
      title: version.title,
      content: version.content,
      pageSettings: version.pageSettings,
      createdAt: recordRef.current?.createdAt ?? version.createdAt,
      updatedAt: new Date().toISOString(),
    });

    recordRef.current = restored;
    titleRef.current = restored.title;
    pageSettingsRef.current = restored.pageSettings;
    setRecord(restored);
    setTitle(restored.title);
    setPageSettings(restored.pageSettings);
    editor.commands.setContent(restored.content as JSONContent);
    setWordCount(getWordCountFromJson(restored.content));
    setCharacterCount(getCharacterCountFromJson(restored.content));
    hasPendingSave.current = false;
    setSaveState("saved");
    showToast("Version restored.", "success");
  }

  async function handleDeleteVersion(versionId: string) {
    const shouldDelete = window.confirm("Delete this local version snapshot?");
    if (!shouldDelete) {
      return;
    }

    await deleteDocumentVersion(documentId, versionId);
    await refreshVersions();
    showToast("Version deleted.", "success");
  }

  async function handleCreateComment(body: string) {
    if (!editor || !body.trim()) {
      return;
    }

    const { from, to, empty } = editor.state.selection;
    const quote = empty ? undefined : editor.state.doc.textBetween(from, to, " ").slice(0, 300);
    const comment = await createDocumentComment({
      documentId,
      body,
      quote,
      from: empty ? undefined : from,
      to: empty ? undefined : to,
    });
    if (!empty) {
      editor.chain().focus().setTextSelection({ from, to }).setInlineComment({ id: comment.id, body }).run();
    }
    await refreshComments();
    showToast("Comment added.", "success");
  }

  async function handleResolveComment(comment: DocumentComment) {
    await updateDocumentComment({
      ...comment,
      resolved: !comment.resolved,
    });
    await refreshComments();
    showToast(comment.resolved ? "Comment reopened." : "Comment resolved.", "success");
  }

  async function handleDeleteComment(commentId: string) {
    const shouldDelete = window.confirm("Delete this local comment?");
    if (!shouldDelete) {
      return;
    }
    await deleteDocumentComment(documentId, commentId);
    await refreshComments();
    showToast("Comment deleted.", "success");
  }

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (hasPendingSave.current || saveState === "saving" || saveState === "error") {
        event.preventDefault();
        event.returnValue = "";
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveState]);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      const commandKey = event.ctrlKey || event.metaKey;
      if (!commandKey) {
        return;
      }

      const key = event.key.toLowerCase();
      if (key === "k") {
        event.preventDefault();
        setCommandPaletteOpen(true);
      }
      if (event.shiftKey && key === "s") {
        event.preventDefault();
        exportText();
      }
      if (!event.shiftKey && key === "s") {
        event.preventDefault();
        void exportTextdoc();
      }
      if (key === "p") {
        event.preventDefault();
        printDocument();
      }
      if (event.altKey && key === "b") {
        event.preventDefault();
        editor?.chain().focus().setPageBreak().run();
      }
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  });

  if (error) {
    return (
      <main className="editor-error">
        <h1>Document error</h1>
        <p>{error}</p>
        <NextLink href="/">Back to dashboard</NextLink>
      </main>
    );
  }

  if (!editor || !record) {
    return <main className="editor-loading">Loading editor...</main>;
  }

  return (
    <main className="editor-shell">
      <section className="editor-glass-panel">
        <div aria-hidden="true" className="glass-highlight left" />
        <div aria-hidden="true" className="glass-highlight right" />
        <header className="editor-header">
          <div className="upgrade-title-row">
            <div className="upgrade-title-left">
              <button aria-label="Back to dashboard" className="icon-button" onClick={goBackToDashboard} type="button">
                <ArrowLeft size={18} />
              </button>
              <input
                aria-label="Document title"
                className="title-input"
                maxLength={120}
                onChange={(event) => commitTitle(event.target.value)}
                value={title}
              />
              <Star aria-hidden="true" className="title-star" size={17} />
            </div>
            <div className="upgrade-header-actions">
              <button aria-label="Toggle Theme" className="round-glass-button" onClick={toggleTheme} type="button">
                {theme === "neon-dark" ? <Sun size={17} /> : <Moon size={17} />}
              </button>
              <button className="share-button" onClick={() => showToast("Local share is not enabled yet.", "info")} type="button">
                <UserPlus size={16} />
                Share
              </button>
              <div aria-label="User Avatar" className="avatar-badge">
                <CircleUserRound size={26} />
              </div>
            </div>
          </div>

          <nav aria-label="Document menu" className="upgrade-menu-row">
            <div className="file-menu-wrap">
              <button className="menu-link" onClick={() => setShowFileMenu((open) => !open)} type="button">
                File
              </button>
              {showFileMenu ? (
                <div className="file-menu-popover">
                  <button onClick={() => { htmlInputRef.current?.click(); setShowFileMenu(false); }} type="button">
                    <FileInput size={15} />
                    Import HTML
                  </button>
                  <button onClick={() => { docxInputRef.current?.click(); setShowFileMenu(false); }} type="button">
                    <FileText size={15} />
                    Import DOCX
                  </button>
                  <button onClick={() => { exportText(); setShowFileMenu(false); }} type="button">
                    <FileText size={15} />
                    Export TXT
                  </button>
                  <button onClick={() => { exportHtml(); setShowFileMenu(false); }} type="button">
                    <Download size={15} />
                    Export HTML
                  </button>
                  <button onClick={() => { void exportDocx(); setShowFileMenu(false); }} type="button">
                    <Download size={15} />
                    Export DOCX
                  </button>
                  <button onClick={() => { void exportTextdoc(); setShowFileMenu(false); }} type="button">
                    <Save size={15} />
                    Save .textdoc
                  </button>
                  <button onClick={() => { printDocument(); setShowFileMenu(false); }} type="button">
                    <Download size={15} />
                    Download PDF
                  </button>
                </div>
              ) : null}
            </div>
            {["Edit", "View"].map((item) => (
              <button className="menu-link" key={item} onClick={() => setCommandPaletteOpen(true)} type="button">
                {item}
              </button>
            ))}
            <button className="menu-link active" type="button">Insert</button>
            {["Format", "Tools", "Extensions"].map((item) => (
              <button className="menu-link" key={item} onClick={() => setCommandPaletteOpen(true)} type="button">
                {item}
              </button>
            ))}
            <button className="menu-link help-link" onClick={() => setCommandPaletteOpen(true)} type="button">
              Help
              <ChevronDown size={13} />
            </button>
          </nav>
          <input
            accept=".html,.htm,text/html"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void importHtml(file);
              }
              event.currentTarget.value = "";
            }}
            ref={htmlInputRef}
            type="file"
          />
          <input
            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void importDocx(file);
              }
              event.currentTarget.value = "";
            }}
            ref={docxInputRef}
            type="file"
          />
        </header>

        <div className="editor-ribbon-frame">
          <EditorRibbon
            characterCount={characterCount}
            editor={editor}
            leftPanelOpen={leftPanelOpen}
            onCreateComment={(body) => void handleCreateComment(body)}
            onDownloadPdf={printDocument}
            onToggleLeftPanel={() => setLeftPanelOpen((open) => !open)}
            onToggleRightPanel={() => setRightPanelOpen((open) => !open)}
            pageSettings={pageSettings}
            pasteMode={pasteMode}
            rightPanelOpen={rightPanelOpen}
            setPageSettings={commitPageSettings}
            setPasteMode={setPasteMode}
            wordCount={wordCount}
          />
        </div>
      </section>

      <div className="mobile-panel-switcher" aria-label="Mobile editor panels">
        <button
          aria-label="Toggle outline panel"
          aria-pressed={leftPanelOpen}
          className={leftPanelOpen ? "toolbar-button active" : "toolbar-button"}
          onClick={() => setLeftPanelOpen((open) => !open)}
          type="button"
        >
          <PanelLeft size={16} />
          Outline
        </button>
        <button
          aria-label="Toggle inspector panel"
          aria-pressed={rightPanelOpen}
          className={rightPanelOpen ? "toolbar-button active" : "toolbar-button"}
          onClick={() => setRightPanelOpen((open) => !open)}
          type="button"
        >
          <PanelRight size={16} />
          Inspector
        </button>
      </div>

      <section
        className={[
          "editor-workspace",
          leftPanelOpen ? "" : "hide-left-panel",
          rightPanelOpen ? "" : "hide-right-panel",
        ].filter(Boolean).join(" ")}
      >
        <aside className="left-panel">
          <h2>Outline</h2>
          <p>{pageDimensions.label}</p>
          <p>
            {pageDimensions.width} x {pageDimensions.height}px
          </p>
          <div className="thumbnail-preview" style={getPageStyle(pageSettings)} />
        </aside>

        <div className="canvas-scroll">
          <div className="ruler horizontal-ruler" />
          <article className="page-frame" style={{ ...getPageStyle(pageSettings), fontFamily: editorFont }}>
            {pageSettings.headerText ? <div className="page-header-text">{pageSettings.headerText}</div> : null}
            <FloatingSelectionToolbar
              editor={editor}
              onCreateComment={(body) => void handleCreateComment(body)}
            />
            <EditorContent editor={editor} />
            {(pageSettings.footerText || pageSettings.showPageNumbers) ? (
              <div className="page-footer-text">
                <span>{pageSettings.footerText}</span>
                {pageSettings.showPageNumbers ? <span>Page 1</span> : null}
              </div>
            ) : null}
          </article>
        </div>

        <EditorSidebar
          comments={comments}
          editor={editor}
          onCreateComment={(body) => void handleCreateComment(body)}
          onCreateVersion={(label) => void handleCreateVersion(label)}
          onDeleteComment={(commentId) => void handleDeleteComment(commentId)}
          onDeleteVersion={(versionId) => void handleDeleteVersion(versionId)}
          onResolveComment={(comment) => void handleResolveComment(comment)}
          onRestoreVersion={(version) => void handleRestoreVersion(version)}
          pageSettings={pageSettings}
          setPageSettings={commitPageSettings}
          versions={versions}
        />
      </section>

      <StatusBar
        characterCount={characterCount}
        pageSettings={pageSettings}
        setPageSettings={commitPageSettings}
        wordCount={wordCount}
      />
      {toast ? (
        <div className={`toast ${toast.tone}`} role="status">
          {toast.message}
        </div>
      ) : null}
      {commandPaletteOpen ? (
        <div className="command-backdrop" role="presentation" onClick={() => setCommandPaletteOpen(false)}>
          <section
            aria-label="Command palette"
            className="command-palette"
            onClick={(event) => event.stopPropagation()}
          >
            <header>
              <strong>Commands</strong>
              <span>Ctrl K</span>
            </header>
            <button onClick={() => { editor.chain().focus().toggleHeading({ level: 1 }).run(); setCommandPaletteOpen(false); }} type="button">
              Heading 1
            </button>
            <button onClick={() => { editor.chain().focus().setPageBreak().run(); setCommandPaletteOpen(false); }} type="button">
              Insert page break
            </button>
            <button onClick={() => { void handleCreateVersion("Command snapshot"); setCommandPaletteOpen(false); }} type="button">
              Save version snapshot
            </button>
            <button onClick={() => { void exportTextdoc(); setCommandPaletteOpen(false); }} type="button">
              Save .textdoc file
            </button>
            <button onClick={() => { exportText(); setCommandPaletteOpen(false); }} type="button">
              Export plain text
            </button>
            <button onClick={() => { printDocument(); setCommandPaletteOpen(false); }} type="button">
              Open print/PDF view
            </button>
          </section>
        </div>
      ) : null}
    </main>
  );
}

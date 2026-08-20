"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArchiveRestore, Download, FileInput, FileText, Plus, Search, Settings, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  createDocument,
  deleteDocument,
  importDocument,
  listDocuments,
} from "@/lib/documents/document-store";
import type { DocumentRecord } from "@/lib/documents/document-model";
import { documentTemplates } from "@/lib/documents/templates";
import {
  downloadTextdocBackup,
  readTextdocBackupFile,
  readTextdocFile,
  textdocAccept,
  textdocBackupAccept,
} from "@/lib/documents/textdoc-file";
import { getWordCountFromJson } from "@/lib/editor/text-index";
import {
  applyLocalSettingsToRecord,
  applyTheme,
  autosaveDelayOptions,
  defaultLocalSettings,
  getLocalSettings,
  saveLocalSettings,
  themeOptions,
  type LocalSettings,
} from "@/lib/settings/local-settings";

type SortMode = "updated" | "title" | "words";

export function Dashboard() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("updated");
  const [settings, setSettings] = useState<LocalSettings>(defaultLocalSettings);
  const textdocInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  const visibleDocuments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return documents
      .filter((document) => document.title.toLowerCase().includes(normalizedQuery))
      .sort((a, b) => {
        if (sortMode === "title") {
          return a.title.localeCompare(b.title);
        }
        if (sortMode === "words") {
          return getWordCountFromJson(b.content) - getWordCountFromJson(a.content);
        }
        return b.updatedAt.localeCompare(a.updatedAt);
      });
  }, [documents, query, sortMode]);

  async function refresh(showLoading = true) {
    if (showLoading) {
      setLoading(true);
    }

    try {
      const nextDocuments = await listDocuments();
      setDocuments(nextDocuments);
    } catch (listError) {
      setError(listError instanceof Error ? listError.message : "Could not load documents.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    Promise.resolve().then(() => {
      if (active) {
        const localSettings = getLocalSettings();
        setSettings(localSettings);
        applyTheme(localSettings.theme);
      }
    });

    listDocuments()
      .then((nextDocuments) => {
        if (!active) {
          return;
        }
        setDocuments(nextDocuments);
      })
      .catch((listError) => {
        if (!active) {
          return;
        }
        setError(listError instanceof Error ? listError.message : "Could not load documents.");
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  function updateSettings(nextSettings: LocalSettings) {
    setSettings(nextSettings);
    saveLocalSettings(nextSettings);
    setNotice("Local app settings saved.");
  }

  async function handleCreate() {
    const created = await createDocument("Untitled document");
    const doc = await importDocument(applyLocalSettingsToRecord(created, settings));
    router.push(`/documents/${doc.id}`);
  }

  async function handleTemplate(templateId: string) {
    const template = documentTemplates.find((candidate) => candidate.id === templateId);
    if (!template) {
      return;
    }

    const doc = await importDocument(applyLocalSettingsToRecord(template.create(), settings));
    router.push(`/documents/${doc.id}`);
  }

  async function handleImport(file: File) {
    try {
      const record = await readTextdocFile(file);
      const imported = await importDocument(record);
      router.push(`/documents/${imported.id}`);
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "Could not open .textdoc file.");
    }
  }

  async function handleBackupImport(file: File) {
    try {
      const records = await readTextdocBackupFile(file);
      await Promise.all(records.map((record) => importDocument(record)));
      setNotice(`Restored ${records.length} local document${records.length === 1 ? "" : "s"}.`);
      setError(null);
      await refresh(false);
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "Could not restore backup.");
    }
  }

  function handleBackupExport() {
    downloadTextdocBackup(documents);
    setNotice(`Exported ${documents.length} local document${documents.length === 1 ? "" : "s"}.`);
  }

  async function handleDelete(id: string) {
    const target = documents.find((document) => document.id === id);
    const shouldDelete = window.confirm(`Delete "${target?.title ?? "this document"}" and its local versions/comments?`);
    if (!shouldDelete) {
      return;
    }

    await deleteDocument(id);
    setNotice("Document deleted.");
    await refresh();
  }

  return (
    <main className="dashboard">
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">Textdoc</p>
          <h1>Professional documents, structured from the first keystroke.</h1>
          <p>
            A local-first Tiptap editor foundation ready for Pages Pro, Supabase, Yjs, and
            server-side PDF export.
          </p>
        </div>
        <div className="dashboard-actions">
          <button className="primary-button" onClick={handleCreate} type="button">
            <Plus size={18} />
            New document
          </button>
          <button className="secondary-button" onClick={() => textdocInputRef.current?.click()} type="button">
            <FileInput size={18} />
            Open .textdoc
          </button>
          <button className="secondary-button" disabled={documents.length === 0} onClick={handleBackupExport} type="button">
            <Download size={18} />
            Backup all
          </button>
          <button className="secondary-button" onClick={() => backupInputRef.current?.click()} type="button">
            <ArchiveRestore size={18} />
            Restore backup
          </button>
        </div>
        <input
          accept={textdocAccept}
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void handleImport(file);
            }
            event.currentTarget.value = "";
          }}
          ref={textdocInputRef}
          type="file"
        />
        <input
          accept={textdocBackupAccept}
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void handleBackupImport(file);
            }
            event.currentTarget.value = "";
          }}
          ref={backupInputRef}
          type="file"
        />
      </section>

      <section className="document-list-section">
        <div className="section-heading">
          <h2>Documents</h2>
          <span>{visibleDocuments.length} shown - {documents.length} total</span>
        </div>

        {error ? <div className="inline-error">{error}</div> : null}
        {notice ? <div className="inline-success">{notice}</div> : null}

        <div className="document-controls">
          <label className="search-field">
            <Search size={16} />
            <input
              aria-label="Search documents"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search documents"
              value={query}
            />
          </label>
          <label>
            Sort
            <select aria-label="Sort documents" onChange={(event) => setSortMode(event.target.value as SortMode)} value={sortMode}>
              <option value="updated">Last updated</option>
              <option value="title">Title</option>
              <option value="words">Word count</option>
            </select>
          </label>
          <button className="toolbar-button" onClick={() => backupInputRef.current?.click()} type="button">
            <Upload size={16} />
            Restore
          </button>
        </div>

        <div className="settings-strip" aria-label="Local app settings">
          <div>
            <Settings size={16} />
            <strong>Local defaults</strong>
          </div>
          <label>
            Theme
            <select
              aria-label="Theme"
              onChange={(event) => updateSettings({ ...settings, theme: event.target.value as LocalSettings["theme"] })}
              value={settings.theme}
            >
              {themeOptions.map((theme) => (
                <option key={theme} value={theme}>{theme === "neon-dark" ? "Neon dark" : "Light"}</option>
              ))}
            </select>
          </label>
          <label>
            Page
            <select
              aria-label="Default page size"
              onChange={(event) => updateSettings({ ...settings, defaultPageSize: event.target.value as LocalSettings["defaultPageSize"] })}
              value={settings.defaultPageSize}
            >
              <option value="letter">Letter</option>
              <option value="a4">A4</option>
              <option value="legal">Legal</option>
            </select>
          </label>
          <label>
            Font
            <select
              aria-label="Default font"
              onChange={(event) => updateSettings({ ...settings, defaultFont: event.target.value as LocalSettings["defaultFont"] })}
              value={settings.defaultFont}
            >
              <option value="Arial">Arial</option>
              <option value="Georgia">Georgia</option>
              <option value="Inter">Inter</option>
              <option value="Times">Times</option>
            </select>
          </label>
          <label>
            Autosave
            <select
              aria-label="Autosave delay"
              onChange={(event) => updateSettings({ ...settings, autosaveDelayMs: Number(event.target.value) as LocalSettings["autosaveDelayMs"] })}
              value={settings.autosaveDelayMs}
            >
              {autosaveDelayOptions.map((delay) => (
                <option key={delay} value={delay}>{delay} ms</option>
              ))}
            </select>
          </label>
        </div>

        <div className="template-grid" aria-label="Document templates">
          {documentTemplates.map((template) => (
            <button
              className="template-card"
              key={template.id}
              onClick={() => void handleTemplate(template.id)}
              type="button"
            >
              <strong>{template.name}</strong>
              <span>{template.description}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="empty-state">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="empty-state">
            <FileText size={28} />
            <p>No documents yet. Create one to open the editor workspace.</p>
          </div>
        ) : visibleDocuments.length === 0 ? (
          <div className="empty-state">
            <Search size={28} />
            <p>No documents match your search.</p>
          </div>
        ) : (
          <div className="document-grid">
            {visibleDocuments.map((document) => (
              <article className="document-card" key={document.id}>
                <Link href={`/documents/${document.id}`} className="document-card-link">
                  <FileText size={22} />
                  <div>
                    <h3>{document.title}</h3>
                    <p>
                      {getWordCountFromJson(document.content)} words - Updated{" "}
                      {new Date(document.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </Link>
                <button
                  aria-label={`Delete ${document.title}`}
                  className="icon-button subtle"
                  onClick={() => void handleDelete(document.id)}
                  type="button"
                >
                  <Trash2 size={17} />
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

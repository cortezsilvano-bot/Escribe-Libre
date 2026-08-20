"use client";

import type { Editor } from "@tiptap/react";
import { CheckCircle2, History, MessageSquarePlus, RotateCcw, Save, Search, Replace, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { DocumentComment, DocumentVersion, PageSettings } from "@/lib/documents/document-model";
import { findMatches, replaceAllMatches } from "@/lib/editor/text-index";

type EditorSidebarProps = {
  editor: Editor;
  pageSettings: PageSettings;
  setPageSettings: (settings: PageSettings) => void;
  versions: DocumentVersion[];
  comments: DocumentComment[];
  onCreateComment: (body: string) => void;
  onResolveComment: (comment: DocumentComment) => void;
  onDeleteComment: (commentId: string) => void;
  onCreateVersion: (label?: string) => void;
  onRestoreVersion: (version: DocumentVersion) => void;
  onDeleteVersion: (versionId: string) => void;
};

export function EditorSidebar({
  editor,
  pageSettings,
  setPageSettings,
  versions,
  comments,
  onCreateComment,
  onResolveComment,
  onDeleteComment,
  onCreateVersion,
  onRestoreVersion,
  onDeleteVersion,
}: EditorSidebarProps) {
  const [query, setQuery] = useState("");
  const [replacement, setReplacement] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [activeMatch, setActiveMatch] = useState(0);
  const [versionLabel, setVersionLabel] = useState("");
  const [commentBody, setCommentBody] = useState("");

  const matches = useMemo(
    () => findMatches(editor, query, { caseSensitive, wholeWord }),
    [caseSensitive, editor, query, wholeWord],
  );

  function selectMatch(index: number) {
    const match = matches[index];
    if (!match) {
      return;
    }
    setActiveMatch(index);
    editor.chain().focus().setTextSelection({ from: match.from, to: match.to }).run();
  }

  function updateMargin(edge: keyof PageSettings["margins"], value: string) {
    setPageSettings({
      ...pageSettings,
      margins: {
        ...pageSettings.margins,
        [edge]: Number(value),
      },
    });
  }

  return (
    <aside className="right-panel">
      <section className="panel-section">
        <h2>Find</h2>
        <label>
          Search
          <div className="input-with-icon">
            <Search size={15} />
            <input onChange={(event) => setQuery(event.target.value)} value={query} />
          </div>
        </label>
        <label>
          Replace
          <div className="input-with-icon">
            <Replace size={15} />
            <input onChange={(event) => setReplacement(event.target.value)} value={replacement} />
          </div>
        </label>
        <div className="checkbox-row">
          <label><input checked={caseSensitive} onChange={(event) => setCaseSensitive(event.target.checked)} type="checkbox" /> Case</label>
          <label><input checked={wholeWord} onChange={(event) => setWholeWord(event.target.checked)} type="checkbox" /> Whole word</label>
        </div>
        <div className="button-row">
          <button className="toolbar-button" disabled={matches.length === 0} onClick={() => selectMatch((activeMatch + 1) % matches.length)} type="button">
            Next
          </button>
          <button className="toolbar-button" disabled={matches.length === 0} onClick={() => replaceAllMatches(editor, matches, replacement)} type="button">
            Replace all
          </button>
        </div>
        <p className="panel-note">{matches.length} matches</p>
      </section>

      <section className="panel-section">
        <div className="panel-title-row">
          <h2>Comments</h2>
          <button
            aria-label="Add comment"
            className="icon-button"
            disabled={!commentBody.trim()}
            onClick={() => {
              onCreateComment(commentBody);
              setCommentBody("");
            }}
            type="button"
          >
            <MessageSquarePlus size={15} />
          </button>
        </div>
        <label>
          Note
          <textarea
            maxLength={1000}
            onChange={(event) => setCommentBody(event.target.value)}
            placeholder="Add a local comment"
            rows={3}
            value={commentBody}
          />
        </label>
        {comments.length === 0 ? (
          <p className="panel-note">No comments yet.</p>
        ) : (
          <div className="comment-list">
            {comments.map((comment) => (
              <article className={comment.resolved ? "comment-row resolved" : "comment-row"} key={comment.id}>
                {comment.quote ? <blockquote>{comment.quote}</blockquote> : null}
                <p>{comment.body}</p>
                <span>{new Date(comment.createdAt).toLocaleString()}</span>
                <div className="button-row">
                  <button className="toolbar-button" onClick={() => onResolveComment(comment)} type="button">
                    <CheckCircle2 size={14} />
                    {comment.resolved ? "Reopen" : "Resolve"}
                  </button>
                  <button className="icon-button subtle" onClick={() => onDeleteComment(comment.id)} type="button" aria-label="Delete comment">
                    <Trash2 size={14} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="panel-section">
        <h2>Page</h2>
        <label>
          Size
          <select
            onChange={(event) => setPageSettings({ ...pageSettings, size: event.target.value as PageSettings["size"] })}
            value={pageSettings.size}
          >
            <option value="letter">Letter</option>
            <option value="a4">A4</option>
            <option value="legal">Legal</option>
          </select>
        </label>
        <label>
          Orientation
          <select
            onChange={(event) => setPageSettings({ ...pageSettings, orientation: event.target.value as PageSettings["orientation"] })}
            value={pageSettings.orientation}
          >
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
        </label>
        <div className="margin-grid">
          {(["top", "right", "bottom", "left"] as const).map((edge) => (
            <label key={edge}>
              {edge}
              <input
                max="2"
                min="0.25"
                onChange={(event) => updateMargin(edge, event.target.value)}
                step="0.25"
                type="number"
                value={pageSettings.margins[edge]}
              />
            </label>
          ))}
        </div>
        <label>
          Header
          <input
            maxLength={200}
            onChange={(event) => setPageSettings({ ...pageSettings, headerText: event.target.value })}
            placeholder="Document header"
            value={pageSettings.headerText}
          />
        </label>
        <label>
          Footer
          <input
            maxLength={200}
            onChange={(event) => setPageSettings({ ...pageSettings, footerText: event.target.value })}
            placeholder="Document footer"
            value={pageSettings.footerText}
          />
        </label>
        <label className="checkbox-line">
          <input
            checked={pageSettings.showPageNumbers}
            onChange={(event) => setPageSettings({ ...pageSettings, showPageNumbers: event.target.checked })}
            type="checkbox"
          />
          Show page numbers
        </label>
      </section>

      <section className="panel-section">
        <div className="panel-title-row">
          <h2>Versions</h2>
          <button
            className="icon-button"
            onClick={() => {
              onCreateVersion(versionLabel.trim() || undefined);
              setVersionLabel("");
            }}
            type="button"
            aria-label="Save version"
          >
            <Save size={15} />
          </button>
        </div>
        <label>
          Snapshot label
          <input
            maxLength={120}
            onChange={(event) => setVersionLabel(event.target.value)}
            placeholder="Before revisions"
            value={versionLabel}
          />
        </label>
        {versions.length === 0 ? (
          <p className="panel-note">No saved versions yet.</p>
        ) : (
          <div className="version-list">
            {versions.map((version) => (
              <article className="version-row" key={version.id}>
                <History size={15} />
                <div>
                  <strong>{version.label}</strong>
                  <span>{new Date(version.createdAt).toLocaleString()}</span>
                </div>
                <button
                  aria-label={`Restore ${version.label}`}
                  className="icon-button"
                  onClick={() => onRestoreVersion(version)}
                  type="button"
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  aria-label={`Delete ${version.label}`}
                  className="icon-button subtle"
                  onClick={() => onDeleteVersion(version.id)}
                  type="button"
                >
                  <Trash2 size={14} />
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </aside>
  );
}

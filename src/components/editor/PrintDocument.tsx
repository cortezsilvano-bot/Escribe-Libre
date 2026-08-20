"use client";

import { EditorContent, useEditor, type JSONContent } from "@tiptap/react";
import NextLink from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import type { DocumentRecord } from "@/lib/documents/document-model";
import { getDocument } from "@/lib/documents/document-store";
import { getEditorExtensions } from "@/lib/editor/editor-extensions";
import { getPageStyle } from "@/lib/pagination/page-settings";

type PrintDocumentProps = {
  documentId: string;
};

export function PrintDocument({ documentId }: PrintDocumentProps) {
  const [record, setRecord] = useState<DocumentRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions: getEditorExtensions(),
    content: "",
    editorProps: {
      attributes: {
        class: "prose-editor print-editor",
      },
    },
  });

  useEffect(() => {
    let mounted = true;

    async function loadDocument() {
      const loaded = await getDocument(documentId);
      if (!mounted) {
        return;
      }

      if (!loaded) {
        setError("Document was not found in local storage.");
        return;
      }

      setRecord(loaded);
      editor?.commands.setContent(loaded.content as JSONContent);
    }

    if (editor) {
      void loadDocument();
    }

    return () => {
      mounted = false;
    };
  }, [documentId, editor]);

  if (error) {
    return (
      <main className="print-shell">
        <p>{error}</p>
        <NextLink href="/">Back to dashboard</NextLink>
      </main>
    );
  }

  if (!record || !editor) {
    return <main className="print-shell">Preparing print view...</main>;
  }

  return (
    <main className="print-shell">
      <header className="print-header">
        <NextLink className="toolbar-button" href={`/documents/${documentId}`}>
          <ArrowLeft size={16} />
          Editor
        </NextLink>
        <h1>{record.title}</h1>
        <button className="toolbar-button" onClick={() => window.print()} type="button">
          <Printer size={16} />
          Print
        </button>
      </header>
      <article className="page-frame print-page" style={getPageStyle(record.pageSettings)}>
        {record.pageSettings.headerText ? (
          <div className="page-header-text">{record.pageSettings.headerText}</div>
        ) : null}
        <EditorContent editor={editor} />
        {(record.pageSettings.footerText || record.pageSettings.showPageNumbers) ? (
          <div className="page-footer-text">
            <span>{record.pageSettings.footerText}</span>
            {record.pageSettings.showPageNumbers ? <span>Page 1</span> : null}
          </div>
        ) : null}
      </article>
    </main>
  );
}

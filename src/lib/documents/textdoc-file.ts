"use client";

import { nanoid } from "nanoid";
import { z } from "zod";
import { documentRecordSchema, type DocumentRecord } from "@/lib/documents/document-model";
import { downloadBlob, safeFileStem } from "@/lib/export/file-download";

type TextdocFilePayload = {
  format: "textdoc.document";
  formatVersion: 1;
  document: DocumentRecord;
};

type TextdocBackupPayload = {
  format: "textdoc.backup";
  formatVersion: 1;
  exportedAt: string;
  documents: DocumentRecord[];
};

const textdocBackupSchema = z.object({
  format: z.literal("textdoc.backup"),
  formatVersion: z.literal(1),
  exportedAt: z.string().datetime(),
  documents: z.array(documentRecordSchema),
});

function normalizeImportedRecord(input: unknown): DocumentRecord {
  const candidate = input as Partial<TextdocFilePayload> | DocumentRecord;
  const rawDocument =
    candidate && typeof candidate === "object" && "document" in candidate
      ? (candidate as Partial<TextdocFilePayload>).document
      : candidate;

  const parsed = documentRecordSchema.parse(rawDocument);
  const now = new Date().toISOString();

  return {
    ...parsed,
    id: nanoid(10),
    title: parsed.title,
    createdAt: now,
    updatedAt: now,
  };
}

export function downloadTextdocFile(record: DocumentRecord) {
  const payload: TextdocFilePayload = {
    format: "textdoc.document",
    formatVersion: 1,
    document: record,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/vnd.textdoc+json;charset=utf-8",
  });
  downloadBlob(blob, `${safeFileStem(record.title)}.textdoc`);
}

export function downloadTextdocBackup(documents: DocumentRecord[]) {
  const payload: TextdocBackupPayload = {
    format: "textdoc.backup",
    formatVersion: 1,
    exportedAt: new Date().toISOString(),
    documents,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/vnd.textdoc.backup+json;charset=utf-8",
  });
  downloadBlob(blob, `textdoc-backup-${new Date().toISOString().slice(0, 10)}.json`);
}

export async function readTextdocFile(file: File): Promise<DocumentRecord> {
  const text = await file.text();
  const parsed = JSON.parse(text) as unknown;
  return normalizeImportedRecord(parsed);
}

export async function readTextdocBackupFile(file: File): Promise<DocumentRecord[]> {
  const text = await file.text();
  const parsed = textdocBackupSchema.parse(JSON.parse(text) as unknown);
  return parsed.documents.map((document) => normalizeImportedRecord(document));
}

export const textdocAccept = ".textdoc,application/json,application/vnd.textdoc+json";
export const textdocBackupAccept = ".json,application/json,application/vnd.textdoc.backup+json";

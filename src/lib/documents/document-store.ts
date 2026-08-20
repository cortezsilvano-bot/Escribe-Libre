"use client";

import { createStore, del, get, keys, set } from "idb-keyval";
import { nanoid } from "nanoid";
import {
  createDocumentRecord,
  documentCommentSchema,
  documentRecordSchema,
  documentVersionSchema,
  type DocumentComment,
  type DocumentRecord,
  type DocumentVersion,
} from "./document-model";

const store = createStore("textdoc", "documents");
const prefix = "document:";
const versionPrefix = "version:";
const commentPrefix = "comment:";

function keyFor(id: string) {
  return `${prefix}${id}`;
}

function versionKeyFor(documentId: string, versionId: string) {
  return `${versionPrefix}${documentId}:${versionId}`;
}

function versionPrefixFor(documentId: string) {
  return `${versionPrefix}${documentId}:`;
}

function commentKeyFor(documentId: string, commentId: string) {
  return `${commentPrefix}${documentId}:${commentId}`;
}

function commentPrefixFor(documentId: string) {
  return `${commentPrefix}${documentId}:`;
}

export async function listDocuments(): Promise<DocumentRecord[]> {
  const allKeys = await keys(store);
  const records = await Promise.all(
    allKeys
      .filter((key) => typeof key === "string" && key.startsWith(prefix))
      .map((key) => get<DocumentRecord>(key, store)),
  );

  return records
    .map((record) => documentRecordSchema.safeParse(record))
    .filter((result) => result.success)
    .map((result) => result.data)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getDocument(id: string): Promise<DocumentRecord | null> {
  const record = await get<DocumentRecord>(keyFor(id), store);
  const result = documentRecordSchema.safeParse(record);
  if (!result.success) {
    return null;
  }

  await set(keyFor(result.data.id), result.data, store);
  return result.data;
}

export async function saveDocument(record: DocumentRecord): Promise<DocumentRecord> {
  const nextRecord = documentRecordSchema.parse({
    ...record,
    updatedAt: new Date().toISOString(),
  });
  await set(keyFor(nextRecord.id), nextRecord, store);
  return nextRecord;
}

export async function createDocument(title?: string): Promise<DocumentRecord> {
  const record = createDocumentRecord(nanoid(10), title);
  await set(keyFor(record.id), record, store);
  return record;
}

export async function importDocument(record: DocumentRecord): Promise<DocumentRecord> {
  const nextRecord = documentRecordSchema.parse(record);
  await set(keyFor(nextRecord.id), nextRecord, store);
  return nextRecord;
}

export async function ensureDocument(id: string): Promise<DocumentRecord> {
  const existing = await getDocument(id);
  if (existing) {
    return existing;
  }

  const record = createDocumentRecord(id);
  await set(keyFor(record.id), record, store);
  return record;
}

export async function deleteDocument(id: string): Promise<void> {
  await del(keyFor(id), store);
  const allKeys = await keys(store);
  await Promise.all(
    allKeys
      .filter(
        (key) =>
          typeof key === "string" &&
          (key.startsWith(versionPrefixFor(id)) || key.startsWith(commentPrefixFor(id))),
      )
      .map((key) => del(key, store)),
  );
}

export async function createDocumentVersion(
  record: DocumentRecord,
  label = "Manual snapshot",
): Promise<DocumentVersion> {
  const version = documentVersionSchema.parse({
    id: nanoid(10),
    documentId: record.id,
    label,
    title: record.title,
    content: record.content,
    pageSettings: record.pageSettings,
    createdAt: new Date().toISOString(),
  });

  await set(versionKeyFor(record.id, version.id), version, store);
  return version;
}

export async function listDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
  const allKeys = await keys(store);
  const records = await Promise.all(
    allKeys
      .filter((key) => typeof key === "string" && key.startsWith(versionPrefixFor(documentId)))
      .map((key) => get<DocumentVersion>(key, store)),
  );

  return records
    .filter((record): record is DocumentVersion => documentVersionSchema.safeParse(record).success)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function deleteDocumentVersion(documentId: string, versionId: string): Promise<void> {
  await del(versionKeyFor(documentId, versionId), store);
}

export async function listDocumentComments(documentId: string): Promise<DocumentComment[]> {
  const allKeys = await keys(store);
  const records = await Promise.all(
    allKeys
      .filter((key) => typeof key === "string" && key.startsWith(commentPrefixFor(documentId)))
      .map((key) => get<DocumentComment>(key, store)),
  );

  return records
    .map((record) => documentCommentSchema.safeParse(record))
    .filter((result) => result.success)
    .map((result) => result.data)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createDocumentComment(
  input: Omit<DocumentComment, "id" | "createdAt" | "updatedAt" | "resolved">,
): Promise<DocumentComment> {
  const now = new Date().toISOString();
  const comment = documentCommentSchema.parse({
    ...input,
    id: nanoid(10),
    resolved: false,
    createdAt: now,
    updatedAt: now,
  });

  await set(commentKeyFor(comment.documentId, comment.id), comment, store);
  return comment;
}

export async function updateDocumentComment(comment: DocumentComment): Promise<DocumentComment> {
  const nextComment = documentCommentSchema.parse({
    ...comment,
    updatedAt: new Date().toISOString(),
  });
  await set(commentKeyFor(nextComment.documentId, nextComment.id), nextComment, store);
  return nextComment;
}

export async function deleteDocumentComment(documentId: string, commentId: string): Promise<void> {
  await del(commentKeyFor(documentId, commentId), store);
}

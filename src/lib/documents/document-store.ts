"use client";

import { createIndexedDbAdapter } from "../storage/indexedDbAdapter";
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

const store = createIndexedDbAdapter();
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
  const allKeys = await store.keys();
  const records = await Promise.all(
    allKeys
      .filter((key) => typeof key === "string" && key.startsWith(prefix))
      .map((key) => store.get<DocumentRecord>(key)),
  );

  return records
    .map((record) => documentRecordSchema.safeParse(record))
    .filter((result) => result.success)
    .map((result) => result.data)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getDocument(id: string): Promise<DocumentRecord | null> {
  const record = await store.get<DocumentRecord>(keyFor(id));
  if (record === undefined) return null;
  const result = documentRecordSchema.safeParse(record);
  if (!result.success || result.data.id !== id) {
    throw new Error("This document is invalid or uses an unsupported version. The stored original has been preserved.");
  }

  await store.set(keyFor(result.data.id), result.data);
  return result.data;
}

export async function saveDocument(record: DocumentRecord): Promise<DocumentRecord> {
  const nextRecord = documentRecordSchema.parse({
    ...record,
    updatedAt: new Date().toISOString(),
  });
  await store.set(keyFor(nextRecord.id), nextRecord);
  return nextRecord;
}

export async function createDocument(title?: string): Promise<DocumentRecord> {
  const record = createDocumentRecord(nanoid(10), title);
  await store.set(keyFor(record.id), record);
  return record;
}

export async function importDocument(record: DocumentRecord): Promise<DocumentRecord> {
  const nextRecord = documentRecordSchema.parse(record);
  await store.set(keyFor(nextRecord.id), nextRecord);
  return nextRecord;
}

export async function ensureDocument(id: string): Promise<DocumentRecord> {
  const existing = await getDocument(id);
  if (existing) {
    return existing;
  }

  const record = createDocumentRecord(id);
  await store.set(keyFor(record.id), record);
  return record;
}

export async function deleteDocument(id: string): Promise<void> {
  await store.delete(keyFor(id));
  const allKeys = await store.keys();
  await Promise.all(
    allKeys
      .filter(
        (key) =>
          typeof key === "string" &&
          (key.startsWith(versionPrefixFor(id)) || key.startsWith(commentPrefixFor(id))),
      )
      .map((key) => store.delete(key)),
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

  await store.set(versionKeyFor(record.id, version.id), version);
  return version;
}

export async function listDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
  const allKeys = await store.keys();
  const records = await Promise.all(
    allKeys
      .filter((key) => typeof key === "string" && key.startsWith(versionPrefixFor(documentId)))
      .map((key) => store.get<DocumentVersion>(key)),
  );

  return records
    .map((record) => documentVersionSchema.safeParse(record))
    .filter((result) => result.success)
    .map((result) => result.data)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function deleteDocumentVersion(documentId: string, versionId: string): Promise<void> {
  await store.delete(versionKeyFor(documentId, versionId));
}

export async function listDocumentComments(documentId: string): Promise<DocumentComment[]> {
  const allKeys = await store.keys();
  const records = await Promise.all(
    allKeys
      .filter((key) => typeof key === "string" && key.startsWith(commentPrefixFor(documentId)))
      .map((key) => store.get<DocumentComment>(key)),
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

  await store.set(commentKeyFor(comment.documentId, comment.id), comment);
  return comment;
}

export async function updateDocumentComment(comment: DocumentComment): Promise<DocumentComment> {
  const nextComment = documentCommentSchema.parse({
    ...comment,
    updatedAt: new Date().toISOString(),
  });
  await store.set(commentKeyFor(nextComment.documentId, nextComment.id), nextComment);
  return nextComment;
}

export async function deleteDocumentComment(documentId: string, commentId: string): Promise<void> {
  await store.delete(commentKeyFor(documentId, commentId));
}

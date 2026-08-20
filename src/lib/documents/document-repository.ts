import type { DocumentRecord, DocumentVersion } from "./document-model";

export type CreateDocumentInput = {
  title?: string;
};

export type DocumentRepository = {
  listDocuments(): Promise<DocumentRecord[]>;
  getDocument(id: string): Promise<DocumentRecord | null>;
  createDocument(input?: CreateDocumentInput): Promise<DocumentRecord>;
  saveDocument(record: DocumentRecord): Promise<DocumentRecord>;
  deleteDocument(id: string): Promise<void>;
  listVersions(documentId: string): Promise<DocumentVersion[]>;
  createVersion(record: DocumentRecord, label?: string): Promise<DocumentVersion>;
  deleteVersion(documentId: string, versionId: string): Promise<void>;
};

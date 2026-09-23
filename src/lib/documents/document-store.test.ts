import { beforeEach, describe, expect, it, vi } from "vitest";
import { createDocumentRecord } from "./document-model";

const state = vi.hoisted(() => ({ records: new Map<IDBValidKey, unknown>(), writes: vi.fn() }));
vi.mock("../storage/indexedDbAdapter", () => ({
  createIndexedDbAdapter: () => ({
    keys: async () => [...state.records.keys()],
    get: async (key: IDBValidKey) => state.records.get(key),
    set: async (key: IDBValidKey, value: unknown) => {
      state.writes(key, value);
      state.records.set(key, value);
    },
    delete: async (key: IDBValidKey) => { state.records.delete(key); },
  }),
}));

import { ensureDocument, getDocument, listDocumentVersions } from "./document-store";

beforeEach(() => { state.records.clear(); state.writes.mockClear(); });

describe("storage recovery boundary", () => {
  it("creates only genuinely missing documents", async () => {
    const record = await ensureDocument("missing");
    expect(record.schemaVersion).toBe(1);
    expect(state.writes).toHaveBeenCalledTimes(1);
  });

  it.each([null, { broken: true }, { ...createDocumentRecord("broken"), schemaVersion: 99 }])(
    "preserves unreadable records", async (original) => {
      state.records.set("document:broken", original);
      await expect(ensureDocument("broken")).rejects.toThrow("preserved");
      expect(state.records.get("document:broken")).toBe(original);
      expect(state.writes).not.toHaveBeenCalled();
    },
  );

  it("does not migrate a record with a mismatched storage identity", async () => {
    state.records.set("document:first", createDocumentRecord("second"));
    await expect(getDocument("first")).rejects.toThrow("preserved");
    expect(state.writes).not.toHaveBeenCalled();
  });

  it("persists migration after a successful legacy read", async () => {
    const record = createDocumentRecord("legacy");
    state.records.set("document:legacy", { ...record, schemaVersion: undefined });
    expect(await getDocument("legacy")).toEqual(record);
    expect(state.records.get("document:legacy")).toEqual(record);
  });

  it("returns migrated snapshots instead of their unparsed originals", async () => {
    const record = createDocumentRecord("legacy");
    state.records.set("version:legacy:v1", { ...record, schemaVersion: undefined, documentId: "legacy", label: "Snapshot" });
    expect((await listDocumentVersions("legacy"))[0].schemaVersion).toBe(1);
  });
});

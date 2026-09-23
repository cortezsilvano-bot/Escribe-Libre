import { createStore, del, get, keys, set } from "idb-keyval";
import type { StorageAdapter } from "./StorageAdapter";

export function createIndexedDbAdapter(): StorageAdapter {
  // Keep the shipped database and keys so existing documents remain accessible.
  const store = createStore("textdoc", "documents");
  return {
    keys: () => keys(store),
    get: <T>(key: IDBValidKey) => get<T>(key, store),
    set: (key, value) => set(key, value, store),
    delete: (key) => del(key, store),
  };
}

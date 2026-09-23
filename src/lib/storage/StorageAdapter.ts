/** Raw persistence only. Canonical validation belongs at the repository boundary. */
export interface StorageAdapter {
  keys(): Promise<IDBValidKey[]>;
  get<T>(key: IDBValidKey): Promise<T | undefined>;
  set(key: IDBValidKey, value: unknown): Promise<void>;
  delete(key: IDBValidKey): Promise<void>;
}

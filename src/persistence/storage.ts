/**
 * Key-value storage adapter.
 * IndexedDB in the browser, in-memory for tests and SSR.
 * Components never touch IndexedDB or localStorage directly.
 */

export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

const DB_NAME = "nexus-local";
const DB_VERSION = 1;
const STORE_NAME = "kv";

export function createMemoryStorage(initial: Record<string, string> = {}): KeyValueStorage {
  const map = new Map<string, string>(Object.entries(initial));
  return {
    async getItem(key) {
      return map.get(key) ?? null;
    },
    async setItem(key, value) {
      map.set(key, value);
    },
    async removeItem(key) {
      map.delete(key);
    },
  };
}

export function createIndexedDbStorage(): KeyValueStorage {
  if (typeof indexedDB === "undefined") {
    return createMemoryStorage();
  }

  let dbPromise: Promise<IDBDatabase> | null = null;

  const open = () => {
    if (!dbPromise) {
      dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error("IndexedDB open failed"));
      });
    }
    return dbPromise;
  };

  const withStore = async <T,>(
    mode: IDBTransactionMode,
    fn: (store: IDBObjectStore) => IDBRequest<T>
  ): Promise<T> => {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, mode);
      const store = tx.objectStore(STORE_NAME);
      const request = fn(store);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
    });
  };

  return {
    async getItem(key) {
      try {
        const value = await withStore("readonly", (store) => store.get(key));
        return typeof value === "string" ? value : null;
      } catch {
        return null;
      }
    },
    async setItem(key, value) {
      await withStore("readwrite", (store) => store.put(value, key));
    },
    async removeItem(key) {
      await withStore("readwrite", (store) => store.delete(key));
    },
  };
}

let defaultStorage: KeyValueStorage | null = null;

export function getDefaultStorage(): KeyValueStorage {
  if (!defaultStorage) {
    defaultStorage = typeof indexedDB === "undefined"
      ? createMemoryStorage()
      : createIndexedDbStorage();
  }
  return defaultStorage;
}

export function setDefaultStorage(storage: KeyValueStorage): void {
  defaultStorage = storage;
}

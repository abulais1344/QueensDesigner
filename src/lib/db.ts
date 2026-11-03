/**
 * Tiny IndexedDB key-value store. IndexedDB (not localStorage) because uploaded
 * product photos quickly exceed localStorage's ~5 MB quota.
 */
const DB_NAME = 'queens-collection'
const STORE = 'kv'

let dbPromise: Promise<IDBDatabase> | null = null

function open() {
  dbPromise ??= new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
  return dbPromise
}

function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest) {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const request = action(db.transaction(STORE, mode).objectStore(STORE))
        request.onsuccess = () => resolve(request.result as T)
        request.onerror = () => reject(request.error)
      }),
  )
}

export const kv = {
  get: <T>(key: string) => run<T | undefined>('readonly', (s) => s.get(key)),
  set: (key: string, value: unknown) => run<void>('readwrite', (s) => s.put(value, key)),
  delete: (key: string) => run<void>('readwrite', (s) => s.delete(key)),
}

const databaseName = "global-migration-hub";
const storeName = "workspace";
const filesKey = "files";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(storeName, { keyPath: "key" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function readFiles<T>(fallback: T): Promise<T> {
  try {
    const database = await openDatabase();
    const value = await new Promise<T | undefined>((resolve, reject) => {
      const request = database
        .transaction(storeName, "readonly")
        .objectStore(storeName)
        .get(filesKey);
      request.onsuccess = () => resolve(request.result?.value as T | undefined);
      request.onerror = () => reject(request.error);
    });
    database.close();
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

export async function writeFiles<T>(files: T): Promise<void> {
  try {
    const database = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(storeName, "readwrite");
      transaction.objectStore(storeName).put({ key: filesKey, value: files });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
    database.close();
  } catch {
    // Browser storage can be unavailable or out of quota; keep the current session usable.
  }
}
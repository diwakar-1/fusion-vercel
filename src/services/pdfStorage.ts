/**
 * FUSION IndexedDB Large Document & PDF Storage
 * Prevents LocalStorage 5MB quota exhaustion by persisting multi-megabyte PDFs in IndexedDB.
 */

const DB_NAME = 'fusion_doc_db';
const STORE_NAME = 'pdf_documents';
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function savePdfToIndexedDb(
  id: string,
  data: { pdfDataUrl?: string; fileName?: string; fileSize?: string }
): Promise<boolean> {
  try {
    const db = await openDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({ id, ...data, savedAt: Date.now() });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch (err) {
    console.warn('[IndexedDB Save Error]', err);
    return false;
  }
}

export async function getPdfFromIndexedDb(
  id: string
): Promise<{ id: string; pdfDataUrl?: string; fileName?: string; fileSize?: string } | null> {
  try {
    const db = await openDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('[IndexedDB Get Error]', err);
    return null;
  }
}

export async function deletePdfFromIndexedDb(id: string): Promise<boolean> {
  try {
    const db = await openDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

/**
 * Converts base64 Data URL to a native Blob URL.
 * Essential for rendering in <object>, <embed>, and <iframe> without Chromium security blocks.
 */
export function dataUrlToBlobUrl(dataUrl: string): string {
  if (!dataUrl) return '';
  if (dataUrl.startsWith('blob:')) return dataUrl;
  if (!dataUrl.startsWith('data:')) return dataUrl;

  try {
    const parts = dataUrl.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
    const binary = atob(parts[1]);
    const len = binary.length;
    const buffer = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      buffer[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([buffer], { type: mime });
    return URL.createObjectURL(blob);
  } catch (err) {
    console.warn('[Blob URL Conversion Error]', err);
    return dataUrl;
  }
}
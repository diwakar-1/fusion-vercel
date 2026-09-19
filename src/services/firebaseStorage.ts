/**
 * FUSION Firebase Cloud Storage Service
 * Handles uploading and retrieving PDF documents from cloud storage.
 * Provides permanent HTTPS URLs that both Diwakar and Ayush can view and download on any device.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || 'AIzaSyBa4R1UgrkWHF4pzw91uY65wRM5DA94hgo',
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || 'studyplanner-d0059.firebaseapp.com',
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || 'studyplanner-d0059',
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || 'studyplanner-d0059.firebasestorage.app',
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '1075761660605',
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || '1:1075761660605:web:d105f58da153c1f4abadd4'
};

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Storage operation timed out after ${ms}ms`));
    }, ms);
    promise
      .then(res => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch(err => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

function getFirebaseStorageInstance() {
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    return getStorage(app);
  } catch (err) {
    console.warn('[Firebase Storage Init Warning]', err);
    return null;
  }
}

/**
 * Uploads a note's PDF to Firebase Storage and returns its public HTTPS download URL.
 * Strictly bounded by timeouts so it never hangs or freezes the UI.
 */
export async function uploadNotePdf(
  noteId: string,
  fileOrBlob: File | Blob,
  fileName: string
): Promise<string | null> {
  let app: any;
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  } catch {
    return null;
  }
  if (!app) return null;

  // Optional: attempt anonymous auth to satisfy Firebase rules that require request.auth != null
  try {
    const { getAuth, signInAnonymously } = await import('firebase/auth');
    const auth = getAuth(app);
    if (!auth.currentUser) {
      await withTimeout(signInAnonymously(auth), 3000).catch(() => {});
    }
  } catch {
    // Continue regardless if auth is disabled
  }

  const buckets = [
    firebaseConfig.storageBucket,
    'studyplanner-d0059.firebasestorage.app'
  ];

  const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const metadata = {
    contentType: 'application/pdf',
    customMetadata: {
      originalName: fileName,
      uploadedAt: new Date().toISOString()
    }
  };

  for (const bucket of Array.from(new Set(buckets))) {
    if (!bucket) continue;
    try {
      const bucketUrl = bucket.startsWith('gs://') ? bucket : `gs://${bucket}`;
      const storage = getStorage(app, bucketUrl);
      const storageRef = ref(storage, `notes_pdfs/${noteId}_${safeFileName}`);
      
      const snapshot = await withTimeout(
        uploadBytes(storageRef, fileOrBlob, metadata),
        8000 // 8-second max timeout per bucket
      );
      
      const downloadUrl = await withTimeout(
        getDownloadURL(snapshot.ref),
        4000 // 4-second max timeout for URL
      );
      
      if (downloadUrl) return downloadUrl;
    } catch (err) {
      console.warn(`[Firebase Storage upload attempt failed for ${bucket}]`, err);
    }
  }

  return null;
}

export function isFirebaseStorageConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.storageBucket);
}

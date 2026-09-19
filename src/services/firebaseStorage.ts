/**
 * FUSION Firebase Cloud Storage Service
 * Handles uploading and retrieving PDF documents from cloud storage.
 * Provides permanent HTTPS URLs that both Diwakar and Ayush can view and download on any device.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || 'AIzaSyAJks1kBH-Jjr4ivAmXgx0IuXGju9FG784',
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || 'shreeganga.firebaseapp.com',
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || 'shreeganga',
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || 'shreeganga.firebasestorage.app',
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '743944932269',
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || '1:743944932269:web:3f7b73398c8f8f6ca8af24'
};

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
 */
export async function uploadNotePdf(
  noteId: string,
  fileOrBlob: File | Blob,
  fileName: string
): Promise<string | null> {
  const storage = getFirebaseStorageInstance();
  if (!storage) return null;

  try {
    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageRef = ref(storage, `notes_pdfs/${noteId}_${safeFileName}`);
    const metadata = {
      contentType: 'application/pdf',
      customMetadata: {
        originalName: fileName,
        uploadedAt: new Date().toISOString()
      }
    };

    const snapshot = await uploadBytes(storageRef, fileOrBlob, metadata);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (err) {
    console.warn('[Firebase PDF Upload Error]', err);
    return null;
  }
}

export function isFirebaseStorageConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.storageBucket);
}

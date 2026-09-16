/**
 * FUSION Cloud Sync Engine
 * Real-time 1-Second Bi-Directional State Synchronization between Web & Android.
 */

import { Capacitor } from '@capacitor/core';

const CLOUD_DOC_IDS: Record<string, string> = {
  diwakar: 'ff808181a09d98f701a0a8863c7e16cc',
  ayush: 'ff808181a09d98f701a0a8863d2016cd'
};

// Cloud sync endpoint: Always synchronize to live Vercel Cloud API so Web (local/deployed) and Android share state in real-time
const getSyncEndpoint = (): string => {
  return 'https://fusion-vercel.vercel.app/api/sync';
};

export interface SyncPayload {
  profile: any;
  dailyTasks: any[];
  dsaTopics: any[];
  notes: any[];
  timetableSchedule: any;
  courses?: any[];          // Playlists synced between Android & Web
  pdfQuestionSheets?: any[]; // PDF and Coding Question sheets synced
  habits?: any[];           // Daily Habits synced
  goals?: any[];            // Goals synced
  mlMilestones?: any[];     // Machine Learning Milestones synced
  geminiApiKey?: string;    // API keys synced so Android keys appear on Web
  youtubeApiKey?: string;
  aiChatMessages?: any[];   // Private FUSE AI chat history per user
  activeTimerState?: any;
  studyLogs?: any[];
  completedProblemIds?: string[];
  partnerChatMessages?: Array<{ id: string; sender: string; text: string; timestamp: string }>;
  lastNudge?: { sender: string; type: string; timestamp: number };
  isVacationPaused?: boolean;
  hasWatchedPlaylistVideoToday?: boolean;
  ayushPassword?: string;
  updatedAt: number;
}

class CloudSyncService {
  private lastSyncTimestamp = 0;
  private isSyncing = false;
  private syncTimer: any = null;
  private pendingPush: Partial<SyncPayload> | null = null;
  private pushDebounceTimer: any = null;

  /**
   * Push local user state to the cloud
   */
  async pushState(user: string, payload: Partial<SyncPayload>): Promise<boolean> {
    this.pendingPush = payload;

    if (this.pushDebounceTimer) {
      clearTimeout(this.pushDebounceTimer);
    }

    return new Promise((resolve) => {
      this.pushDebounceTimer = setTimeout(async () => {
        const currentUserKey = (user || 'diwakar').toLowerCase().includes('ayush') ? 'ayush' : 'diwakar';
        const now = Date.now();
        const storedGeminiKey = localStorage.getItem(`fusion_gemini_api_key_${currentUserKey}`) || undefined;
        const storedYtKey = localStorage.getItem(`fusion_yt_api_key_${currentUserKey}`) || undefined;

        const payloadToPush = {
          ...this.pendingPush,
          geminiApiKey: this.pendingPush?.geminiApiKey || storedGeminiKey,
          youtubeApiKey: this.pendingPush?.youtubeApiKey || storedYtKey,
          updatedAt: now
        };

        try {
          // 1. Try primary API endpoint with explicit ?user= query parameter
          const baseEndpoint = getSyncEndpoint();
          const endpoint = `${baseEndpoint}?user=${encodeURIComponent(currentUserKey)}`;
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user: currentUserKey,
              payload: payloadToPush,
              timestamp: now
            })
          });

          if (response.ok) {
            this.lastSyncTimestamp = now;
            try { localStorage.setItem(`fusion_last_sync_${currentUserKey}`, String(now)); } catch {}
            resolve(true);
            return;
          }
        } catch {
          // Fallback to direct cloud document if serverless is unreachable
        }

        try {
          // 2. Direct Cloud Document Fallback
          const docId = CLOUD_DOC_IDS[currentUserKey];
          if (docId) {
            const fallbackRes = await fetch(`https://api.restful-api.dev/objects/${docId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: `fusion_cloud_store_${currentUserKey}`,
                data: {
                  ...payloadToPush,
                  user: currentUserKey,
                  lastUpdated: now
                }
              })
            });
            if (fallbackRes.ok) {
              this.lastSyncTimestamp = now;
              try { localStorage.setItem(`fusion_last_sync_${currentUserKey}`, String(now)); } catch {}
              resolve(true);
              return;
            }
          }
        } catch {}

        resolve(false);
      }, 250); // Fast 250ms debounce for near-instant responsiveness
    });
  }

  /**
   * Pull latest remote state from the cloud (every second)
   */
  async pullState(
    user: string,
    onRemoteUpdate: (data: SyncPayload, partnerData: any) => void
  ): Promise<void> {
    if (this.isSyncing) return;
    this.isSyncing = true;

    const currentUserKey = (user || 'diwakar').toLowerCase().includes('ayush') ? 'ayush' : 'diwakar';
    const partnerUserKey = currentUserKey === 'diwakar' ? 'ayush' : 'diwakar';

    if (this.lastSyncTimestamp === 0) {
      try {
        const savedTs = Number(localStorage.getItem(`fusion_last_sync_${currentUserKey}`) || 0);
        if (savedTs > 0) this.lastSyncTimestamp = savedTs;
      } catch {}
    }

    try {
      // 1. Try primary sync endpoint
      const endpoint = `${getSyncEndpoint()}?user=${encodeURIComponent(currentUserKey)}&since=${this.lastSyncTimestamp}`;
      const response = await fetch(endpoint, {
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data && (result.lastUpdated > this.lastSyncTimestamp || this.lastSyncTimestamp === 0)) {
          this.lastSyncTimestamp = result.lastUpdated || Date.now();
          try { localStorage.setItem(`fusion_last_sync_${currentUserKey}`, String(this.lastSyncTimestamp)); } catch {}
          onRemoteUpdate(result.data, result.partner?.data);
        } else if (result.success && result.partner?.data) {
          onRemoteUpdate(null as any, result.partner.data);
        }
        return;
      }
    } catch {
      // Fallback to direct cloud store
    } finally {
      this.isSyncing = false;
    }

    // Direct fallback if API was unreachable
    try {
      const docId = CLOUD_DOC_IDS[currentUserKey];
      const partnerDocId = CLOUD_DOC_IDS[partnerUserKey];

      const [userRes, partnerRes] = await Promise.all([
        docId ? fetch(`https://api.restful-api.dev/objects/${docId}`) : Promise.resolve(null),
        partnerDocId ? fetch(`https://api.restful-api.dev/objects/${partnerDocId}`) : Promise.resolve(null)
      ]);

      const userJson = userRes && userRes.ok ? await userRes.json() : null;
      const partnerJson = partnerRes && partnerRes.ok ? await partnerRes.json() : null;

      const userData = userJson?.data;
      const partnerData = partnerJson?.data;

      if (userData && (userData.lastUpdated > this.lastSyncTimestamp || this.lastSyncTimestamp === 0)) {
        this.lastSyncTimestamp = userData.lastUpdated || Date.now();
        try { localStorage.setItem(`fusion_last_sync_${currentUserKey}`, String(this.lastSyncTimestamp)); } catch {}
        onRemoteUpdate(userData, partnerData);
      } else if (partnerData) {
        onRemoteUpdate(null as any, partnerData);
      }
    } catch {}
  }

  /**
   * Start 1-second continuous auto-sync loop
   */
  startAutoSync(
    getUser: () => string,
    onRemoteUpdate: (data: SyncPayload, partnerData: any) => void
  ): () => void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    // Initial pull immediately on startup
    const initialUser = getUser();
    if (initialUser) {
      this.pullState(initialUser, onRemoteUpdate);
    }

    // Run every 1000ms (1 second) for real-time responsiveness
    this.syncTimer = setInterval(() => {
      const currentUser = getUser();
      if (currentUser) {
        this.pullState(currentUser, onRemoteUpdate);
      }
    }, 1000);

    return () => {
      if (this.syncTimer) {
        clearInterval(this.syncTimer);
        this.syncTimer = null;
      }
    };
  }

  /**
   * Fetch Ayush's permanent password from Cloud Sync Store if missing locally
   */
  async fetchAyushPassword(): Promise<string | null> {
    try {
      const endpoint = `${getSyncEndpoint()}?user=ayush`;
      const res = await fetch(endpoint, { headers: { 'Accept': 'application/json' } });
      if (res.ok) {
        const json = await res.json();
        if (json?.data?.ayushPassword) return json.data.ayushPassword;
      }
    } catch {}

    try {
      const docId = CLOUD_DOC_IDS['ayush'];
      const res = await fetch(`https://api.restful-api.dev/objects/${docId}`);
      if (res.ok) {
        const json = await res.json();
        return json?.data?.ayushPassword || null;
      }
    } catch {}

    return null;
  }

  /**
   * Save Ayush's permanent password to Cloud Sync Store
   */
  async saveAyushPassword(password: string): Promise<boolean> {
    const clean = password.trim();
    if (!clean) return false;

    try {
      const endpoint = getSyncEndpoint();
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: 'ayush',
          payload: { ayushPassword: clean },
          timestamp: Date.now()
        })
      });
    } catch {}

    try {
      const docId = CLOUD_DOC_IDS['ayush'];
      let existingData: any = {};
      try {
        const getRes = await fetch(`https://api.restful-api.dev/objects/${docId}`);
        if (getRes.ok) {
          const json = await getRes.json();
          existingData = json?.data || {};
        }
      } catch {}

      const res = await fetch(`https://api.restful-api.dev/objects/${docId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'fusion_cloud_store_ayush',
          data: {
            ...existingData,
            ayushPassword: clean,
            lastUpdated: Date.now()
          }
        })
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}

export const cloudSync = new CloudSyncService();

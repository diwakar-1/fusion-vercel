/**
 * FUSION Cloud Sync Engine
 * High-performance, low-overhead bidirectional state synchronizer between Web & Android.
 * Features smart visibility-based intervals, multi-tab coordination, and instant hydration.
 */

import { Capacitor } from '@capacitor/core';

const CLOUD_DOC_IDS: Record<string, string> = {
  diwakar: 'ff808181a09d98f701a0a8863c7e16cc',
  ayush: 'ff808181a09d98f701a0a8863d2016cd'
};

// Single production backend ONLY — never localhost / alternate hosts
const RENDER_SYNC = 'https://fussion-api.onrender.com/api/v1/sync';
const RENDER_CHAT = 'https://fussion-api.onrender.com/api/v1/friends/chat';

const getSyncEndpoint = (): string => {
  const fromEnv = (import.meta as any).env?.VITE_SYNC_URL as string | undefined;
  const url = (fromEnv && fromEnv.trim()) || RENDER_SYNC;
  // Hard lock: if env points elsewhere, still use Render
  if (!url.includes('fussion-api.onrender.com')) return RENDER_SYNC;
  return url;
};

const getChatEndpoint = (): string => {
  const fromEnv = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
  if (fromEnv && fromEnv.trim() && fromEnv.includes('fussion-api.onrender.com')) {
    return `${fromEnv.replace(/\/$/, '')}/friends/chat`;
  }
  return RENDER_CHAT;
};

export interface SyncPayload {
  profile: any;
  dailyTasks: any[];
  dsaTopics: any[];
  notes: any[];
  timetableSchedule: any;
  courses?: any[];          // Playlists synced between Android & Web
  deletedCourseIds?: string[]; // Tombstone list of deleted courses
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
  deletedNoteIds?: string[];
  updatedAt: number;
}

const ARRAY_KEYS = new Set([
  'notes', 'dailyTasks', 'dsaTopics', 'courses', 'pdfQuestionSheets',
  'habits', 'goals', 'mlMilestones', 'aiChatMessages', 'studyLogs',
  'completedProblemIds', 'partnerChatMessages', 'deletedCourseIds', 'deletedNoteIds'
]);

function sanitizePushPayload(payload: Partial<SyncPayload>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [key, value] of Object.entries(payload || {})) {
    if (value === undefined || value === null) continue;
    if (ARRAY_KEYS.has(key) && Array.isArray(value) && value.length === 0) continue;
    if ((key === 'geminiApiKey' || key === 'youtubeApiKey') && !String(value).trim()) continue;
    out[key] = value;
  }
  return out;
}

class CloudSyncService {
  private lastSyncTimestamp = 0;
  private lastPartnerSyncTimestamp = 0;
  private isSyncing = false;
  private syncTimer: any = null;
  private pendingPush: Partial<SyncPayload> | null = null;
  private pushDebounceTimer: any = null;
  private hasInitialPulledUsers: Record<string, boolean> = {};

  /**
   * Direct fetch user and partner state from cloud (used during login to guarantee immediate hydration)
   */
  async fetchStateDirect(user: string): Promise<{ data: SyncPayload | null; partnerData: any; sharedNotes?: any[] }> {
    const currentUserKey = (user || 'diwakar').toLowerCase().includes('ayush') ? 'ayush' : 'diwakar';
    const partnerUserKey = currentUserKey === 'diwakar' ? 'ayush' : 'diwakar';

    // 1. Try primary sync endpoint with a 25s timeout (supports heavy payloads over Render)
    try {
      const endpoint = `${getSyncEndpoint()}?user=${encodeURIComponent(currentUserKey)}&since=0`;
      const response = await fetch(endpoint, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(25000)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          if (result.lastUpdated) {
            this.lastSyncTimestamp = result.lastUpdated;
            try { localStorage.setItem(`fusion_last_sync_${currentUserKey}`, String(this.lastSyncTimestamp)); } catch {}
          }
          if (result.partner?.lastUpdated) {
            this.lastPartnerSyncTimestamp = result.partner.lastUpdated;
          }
          this.hasInitialPulledUsers[currentUserKey] = true;
          return {
            data: result.data || null,
            partnerData: result.partner?.data || null,
            sharedNotes: Array.isArray(result.sharedNotes) ? result.sharedNotes : []
          };
        }
      }
    } catch {
      // Fallback
    }

    // 2. Direct Cloud Document Fallback
    try {
      const docId = CLOUD_DOC_IDS[currentUserKey];
      const partnerDocId = CLOUD_DOC_IDS[partnerUserKey];

      const [userRes, partnerRes] = await Promise.all([
        docId ? fetch(`https://api.restful-api.dev/objects/${docId}`, { signal: AbortSignal.timeout(6000) }) : Promise.resolve(null),
        partnerDocId ? fetch(`https://api.restful-api.dev/objects/${partnerDocId}`, { signal: AbortSignal.timeout(6000) }) : Promise.resolve(null)
      ]);

      const userJson = userRes && userRes.ok ? await userRes.json() : null;
      const partnerJson = partnerRes && partnerRes.ok ? await partnerRes.json() : null;

      if (userJson?.data) {
        this.lastSyncTimestamp = userJson.data.lastUpdated || Date.now();
        this.hasInitialPulledUsers[currentUserKey] = true;
        try { localStorage.setItem(`fusion_last_sync_${currentUserKey}`, String(this.lastSyncTimestamp)); } catch {}
        return { data: userJson.data, partnerData: partnerJson?.data || null };
      }
    } catch {}

    return { data: null, partnerData: null };
  }

  /**
   * Push local user state to the cloud with debouncing
   */
  async pushState(user: string, payload: Partial<SyncPayload>): Promise<boolean> {
    this.pendingPush = { ...(this.pendingPush || {}), ...payload };

    if (this.pushDebounceTimer) {
      clearTimeout(this.pushDebounceTimer);
    }

    return new Promise((resolve) => {
      this.pushDebounceTimer = setTimeout(async () => {
        const success = await this.executePush(user, this.pendingPush || payload);
        this.pendingPush = null;
        resolve(success);
      }, 350);
    });
  }

  /**
   * Immediate push without debouncing (for deletions, task creation, or critical actions)
   */
  async pushStateDirect(user: string, payload: Partial<SyncPayload>): Promise<boolean> {
    if (this.pushDebounceTimer) {
      clearTimeout(this.pushDebounceTimer);
      this.pushDebounceTimer = null;
    }
    const combined = { ...(this.pendingPush || {}), ...payload };
    this.pendingPush = null;
    return this.executePush(user, combined);
  }

  private async executePush(user: string, payload: Partial<SyncPayload>): Promise<boolean> {
    const currentUserKey = (user || 'diwakar').toLowerCase().includes('ayush') ? 'ayush' : 'diwakar';
    const now = Date.now();
    const storedGeminiKey = localStorage.getItem(`fusion_gemini_api_key_${currentUserKey}`) || undefined;
    const storedYtKey = localStorage.getItem(`fusion_yt_api_key_${currentUserKey}`) || undefined;

    const payloadToPush = sanitizePushPayload({
      ...payload,
      geminiApiKey: payload?.geminiApiKey || storedGeminiKey,
      youtubeApiKey: payload?.youtubeApiKey || storedYtKey,
      updatedAt: now
    });

    try {
      // 1. Try primary API endpoint
      const baseEndpoint = getSyncEndpoint();
      const endpoint = `${baseEndpoint}?user=${encodeURIComponent(currentUserKey)}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: currentUserKey,
          payload: payloadToPush,
          timestamp: now
        }),
        signal: AbortSignal.timeout(8000)
      });

      if (response.ok) {
        this.lastSyncTimestamp = now;
        try { localStorage.setItem(`fusion_last_sync_${currentUserKey}`, String(now)); } catch {}
        return true;
      }
    } catch {
      // Fallback
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
          }),
          signal: AbortSignal.timeout(6000)
        });
        if (fallbackRes.ok) {
          this.lastSyncTimestamp = now;
          try { localStorage.setItem(`fusion_last_sync_${currentUserKey}`, String(now)); } catch {}
          return true;
        }
      }
    } catch {}

    return false;
  }

  /**
   * Pull latest remote state from the cloud only when data has genuinely changed
   */
  async pullState(
    user: string,
    onRemoteUpdate: (data: SyncPayload | null, partnerData: any, meta?: { sharedNotes?: any[]; duoChat?: any[] }) => void
  ): Promise<void> {
    if (this.isSyncing) return;
    this.isSyncing = true;

    const currentUserKey = (user || 'diwakar').toLowerCase().includes('ayush') ? 'ayush' : 'diwakar';
    const partnerUserKey = currentUserKey === 'diwakar' ? 'ayush' : 'diwakar';
    const isFirstPull = !this.hasInitialPulledUsers[currentUserKey];

    if (this.lastSyncTimestamp === 0 && !isFirstPull) {
      try {
        const savedTs = Number(localStorage.getItem(`fusion_last_sync_${currentUserKey}`) || 0);
        if (savedTs > 0) this.lastSyncTimestamp = savedTs;
      } catch {}
    }

    const sinceParam = isFirstPull ? 0 : this.lastSyncTimestamp;

    try {
      // 1. Primary sync endpoint
      const endpoint = `${getSyncEndpoint()}?user=${encodeURIComponent(currentUserKey)}&since=${sinceParam}`;
      const response = await fetch(endpoint, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(20000)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const userHasNew = isFirstPull || (result.data && (result.hasNewData || (result.lastUpdated && result.lastUpdated > this.lastSyncTimestamp)));
          const partnerHasNew = Boolean(
            result.partner?.data && (
              isFirstPull || 
              !this.lastPartnerSyncTimestamp ||
              (result.partner.lastUpdated && result.partner.lastUpdated > this.lastPartnerSyncTimestamp) ||
              result.partner.data.profile
            )
          );

          if (userHasNew) {
            this.lastSyncTimestamp = result.lastUpdated || Date.now();
            try { localStorage.setItem(`fusion_last_sync_${currentUserKey}`, String(this.lastSyncTimestamp)); } catch {}
          }

          if (partnerHasNew && result.partner?.lastUpdated) {
            this.lastPartnerSyncTimestamp = result.partner.lastUpdated;
          }

          this.hasInitialPulledUsers[currentUserKey] = true;

          // ONLY trigger update if data actually changed, stopping infinite multi-tab re-renders!
          if (userHasNew || partnerHasNew || (Array.isArray(result.duoChat) && result.duoChat.length > 0)) {
            const sharedNotes = Array.isArray(result.sharedNotes) ? result.sharedNotes : undefined;
            const duoChat = Array.isArray(result.duoChat) ? result.duoChat : undefined;
            onRemoteUpdate(
              userHasNew ? result.data : null,
              partnerHasNew ? result.partner?.data : null,
              { sharedNotes, duoChat }
            );
          }
          return;
        }
      }
    } catch {
      // Fallback
    } finally {
      this.isSyncing = false;
    }

    // Direct fallback if API was unreachable
    try {
      const docId = CLOUD_DOC_IDS[currentUserKey];
      const partnerDocId = CLOUD_DOC_IDS[partnerUserKey];

      const [userRes, partnerRes] = await Promise.all([
        docId ? fetch(`https://api.restful-api.dev/objects/${docId}`, { signal: AbortSignal.timeout(5000) }) : Promise.resolve(null),
        partnerDocId ? fetch(`https://api.restful-api.dev/objects/${partnerDocId}`, { signal: AbortSignal.timeout(5000) }) : Promise.resolve(null)
      ]);

      const userJson = userRes && userRes.ok ? await userRes.json() : null;
      const partnerJson = partnerRes && partnerRes.ok ? await partnerRes.json() : null;

      const userData = userJson?.data;
      const partnerData = partnerJson?.data;

      const userHasNew = userData && (isFirstPull || userData.lastUpdated > this.lastSyncTimestamp || this.lastSyncTimestamp === 0);
      const partnerHasNew = partnerData && (isFirstPull || partnerData.lastUpdated > this.lastPartnerSyncTimestamp);

      if (userHasNew) {
        this.lastSyncTimestamp = userData.lastUpdated || Date.now();
        try { localStorage.setItem(`fusion_last_sync_${currentUserKey}`, String(this.lastSyncTimestamp)); } catch {}
      }

      if (partnerHasNew) {
        this.lastPartnerSyncTimestamp = partnerData.lastUpdated || Date.now();
      }

      this.hasInitialPulledUsers[currentUserKey] = true;

      if (userHasNew || partnerHasNew) {
        onRemoteUpdate(userHasNew ? userData : null, partnerHasNew ? partnerData : null);
      }
    } catch {}
  }

  /**
   * Start intelligent auto-sync loop:
   * 6s polling when tab is active/visible, 30s when backgrounded, immediate pull on tab focus.
   * Completely eliminates video stuttering and multi-tab CPU lag.
   */
  startAutoSync(
    getUser: () => string,
    onRemoteUpdate: (data: SyncPayload | null, partnerData: any, meta?: { sharedNotes?: any[]; duoChat?: any[] }) => void
  ): () => void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }

    const runPull = () => {
      const currentUser = getUser();
      if (currentUser) {
        this.pullState(currentUser, onRemoteUpdate);
      }
    };

    // Initial pull immediately
    runPull();

    let currentIntervalMs = (typeof document !== 'undefined' && document.visibilityState === 'hidden') ? 30000 : 6000;

    const setupTimer = (intervalMs: number) => {
      if (this.syncTimer) clearInterval(this.syncTimer);
      this.syncTimer = setInterval(runPull, intervalMs);
    };

    setupTimer(currentIntervalMs);

    const handleVisibilityChange = () => {
      if (typeof document === 'undefined') return;
      if (document.visibilityState === 'visible') {
        setupTimer(6000);
        runPull(); // Immediate pull on tab wake-up
      } else {
        setupTimer(30000); // Back off to 30s in hidden tabs to save CPU and battery
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      if (this.syncTimer) {
        clearInterval(this.syncTimer);
        this.syncTimer = null;
      }
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }

  async pullDuoChat(since = 0): Promise<any[]> {
    try {
      const url = since > 0 ? `${getChatEndpoint()}?since=${since}` : getChatEndpoint();
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(10000)
      });
      if (res.status === 429) return [];
      if (!res.ok) return [];
      const json = await res.json();
      if (Array.isArray(json)) return json;
      if (Array.isArray(json?.messages)) return json.messages;
      if (Array.isArray(json?.data)) return json.data;
      return [];
    } catch {
      return [];
    }
  }

  async pushDuoChat(msg: { id: string; sender: string; text: string; timestamp: string }): Promise<boolean> {
    const body = JSON.stringify(msg);
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch(getChatEndpoint(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          signal: AbortSignal.timeout(12000)
        });
        if (res.ok) return true;
        if (res.status === 429) {
          await new Promise(r => setTimeout(r, 800 * (attempt + 1)));
          continue;
        }
      } catch {
        await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
      }
    }
    return false;
  }

  /** Merge chat arrays without losing messages (id + near-duplicate guard). */
  mergeChatMessages(prev: any[], incoming: any[]): any[] {
    const out = Array.isArray(prev) ? [...prev] : [];
    const byId = new Set(out.map(m => m?.id).filter(Boolean));
    const fingerprint = new Set(
      out.map(m => `${String(m?.sender || '').toLowerCase()}|${String(m?.text || '').trim()}`)
    );

    for (const raw of incoming || []) {
      if (!raw || !raw.text || raw.isSystemProfileUpdate || raw.text === '__PROFILE_UPDATE__') continue;
      const senderRaw = String(raw.sender || '');
      const sender = senderRaw.toLowerCase().includes('ayush') ? 'Ayush' : 'Diwakar';
      const id = raw.id || `pc_${raw.ts || Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      if (byId.has(id)) continue;
      const fp = `${sender.toLowerCase()}|${String(raw.text).trim()}`;
      // Skip near-duplicates from double-post (same text+sender already present)
      if (fingerprint.has(fp) && !raw.id) continue;
      byId.add(id);
      fingerprint.add(fp);
      out.push({
        id,
        sender,
        text: String(raw.text).trim(),
        timestamp: raw.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ...(raw.ts ? { ts: raw.ts } : {})
      });
    }
    return out;
  }

  /**
   * Fetch Ayush's permanent password from Cloud Sync Store if missing locally
   */
  async fetchAyushPassword(): Promise<string | null> {
    try {
      const endpoint = `${getSyncEndpoint()}?user=ayush`;
      const res = await fetch(endpoint, { headers: { 'Accept': 'application/json' }, signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const json = await res.json();
        if (json?.data?.ayushPassword) return json.data.ayushPassword;
      }
    } catch {}

    try {
      const docId = CLOUD_DOC_IDS['ayush'];
      const res = await fetch(`https://api.restful-api.dev/objects/${docId}`, { signal: AbortSignal.timeout(5000) });
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
        }),
        signal: AbortSignal.timeout(6000)
      });
    } catch {}

    try {
      const docId = CLOUD_DOC_IDS['ayush'];
      let existingData: any = {};
      try {
        const getRes = await fetch(`https://api.restful-api.dev/objects/${docId}`, { signal: AbortSignal.timeout(5000) });
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
        }),
        signal: AbortSignal.timeout(6000)
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}

export const cloudSync = new CloudSyncService();

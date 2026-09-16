/**
 * FUSION Cloud Sync Engine
 * Real-time 1-Second Bi-Directional State Synchronization between Web & Android.
 */

import { Capacitor } from '@capacitor/core';

// Cloud sync endpoint
const getSyncEndpoint = (): string => {
  if (Capacitor.isNativePlatform()) {
    // Android App connects directly to deployed Vercel Cloud API
    return 'https://fusion-vercel.vercel.app/api/sync';
  }
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return '/api/sync';
    }
    return `${window.location.origin}/api/sync`;
  }
  return 'https://fusion-vercel.vercel.app/api/sync';
};

export interface SyncPayload {
  profile: any;
  dailyTasks: any[];
  dsaTopics: any[];
  notes: any[];
  timetableSchedule: any;
  activeTimerState?: any;
  studyLogs?: any[];
  completedProblemIds?: string[];
  updatedAt: number;
}

class CloudSyncService {
  private lastSyncTimestamp = 0;
  private isSyncing = false;
  private syncTimer: any = null;
  private pendingPush: SyncPayload | null = null;
  private pushDebounceTimer: any = null;

  /**
   * Push local user state to the cloud
   */
  async pushState(user: string, payload: SyncPayload): Promise<boolean> {
    this.pendingPush = payload;

    if (this.pushDebounceTimer) {
      clearTimeout(this.pushDebounceTimer);
    }

    return new Promise((resolve) => {
      this.pushDebounceTimer = setTimeout(async () => {
        try {
          const endpoint = getSyncEndpoint();
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user,
              payload: this.pendingPush,
              timestamp: Date.now()
            })
          });

          if (response.ok) {
            this.lastSyncTimestamp = Date.now();
            resolve(true);
          } else {
            resolve(false);
          }
        } catch {
          resolve(false);
        }
      }, 300); // 300ms debounce for high performance
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

    try {
      const endpoint = `${getSyncEndpoint()}?user=${encodeURIComponent(user)}&since=${this.lastSyncTimestamp}`;
      const response = await fetch(endpoint, {
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data && result.lastUpdated > this.lastSyncTimestamp) {
          this.lastSyncTimestamp = result.lastUpdated;
          onRemoteUpdate(result.data, result.partner?.data);
        } else if (result.success && result.partner?.data) {
          onRemoteUpdate(null as any, result.partner.data);
        }
      }
    } catch {} finally {
      this.isSyncing = false;
    }
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
}

export const cloudSync = new CloudSyncService();

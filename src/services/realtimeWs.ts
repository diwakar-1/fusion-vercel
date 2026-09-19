/**
 * Realtime WebSocket client — always talks to production Fussion API.
 * wss://fussion-api.onrender.com/ws
 */

const RENDER_WS = 'wss://fussion-api.onrender.com/ws';

type WsHandler = (event: { type: string; payload: any; timestamp?: any; from_user?: string }) => void;
type StatusHandler = (connected: boolean) => void;

function buildWsUrl(user?: string): string {
  const fromEnv = ((import.meta as any).env?.VITE_WS_URL as string | undefined)?.trim();
  let base = fromEnv || RENDER_WS;
  if (!base.includes('fussion-api.onrender.com')) {
    base = RENDER_WS;
  }
  const params = new URLSearchParams();
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('fusion_token') : null;
  if (token) params.set('token', token);
  if (user) {
    params.set('user', user.toLowerCase().includes('ayush') ? 'ayush' : 'diwakar');
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

class RealtimeWsClient {
  private ws: WebSocket | null = null;
  private handlers = new Set<WsHandler>();
  private statusHandlers = new Set<StatusHandler>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private intentionalClose = false;
  private backoffMs = 1000;
  private currentUser = '';
  private connected = false;

  isConnected(): boolean {
    return this.connected && this.ws?.readyState === WebSocket.OPEN;
  }

  subscribe(handler: WsHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  onStatus(handler: StatusHandler): () => void {
    this.statusHandlers.add(handler);
    handler(this.isConnected());
    return () => this.statusHandlers.delete(handler);
  }

  connect(user: string) {
    this.currentUser = user || '';
    this.intentionalClose = false;
    // Force fresh socket when user changes
    if (this.ws) {
      try {
        this.ws.close();
      } catch {}
      this.ws = null;
    }
    this.open();
  }

  disconnect() {
    this.intentionalClose = true;
    this.clearTimers();
    if (this.ws) {
      try {
        this.ws.close();
      } catch {}
      this.ws = null;
    }
    this.setConnected(false);
  }

  send(type: string, payload?: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return false;
    try {
      this.ws.send(JSON.stringify({ type, payload, timestamp: Date.now() }));
      return true;
    } catch {
      return false;
    }
  }

  private setConnected(value: boolean) {
    this.connected = value;
    this.statusHandlers.forEach((h) => {
      try {
        h(value);
      } catch {}
    });
  }

  private clearTimers() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private open() {
    if (typeof WebSocket === 'undefined') return;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.clearTimers();
    const url = buildWsUrl(this.currentUser);

    try {
      this.ws = new WebSocket(url);
    } catch {
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.setConnected(true);
      this.backoffMs = 1000;
      this.send('JOIN', { room: 'duo_chat' });
      this.pingTimer = setInterval(() => this.send('PING', {}), 20000);
    };

    this.ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (!data || typeof data !== 'object') return;
        const type = String(data.type || '').toUpperCase();
        if (type === 'PONG' || type === 'CONNECTED' || type === 'JOINED') return;
        this.handlers.forEach((h) => {
          try {
            h(data);
          } catch {}
        });
      } catch {}
    };

    this.ws.onerror = () => {};

    this.ws.onclose = () => {
      this.setConnected(false);
      this.ws = null;
      if (this.pingTimer) {
        clearInterval(this.pingTimer);
        this.pingTimer = null;
      }
      if (!this.intentionalClose) this.scheduleReconnect();
    };
  }

  private scheduleReconnect() {
    if (this.intentionalClose) return;
    if (this.reconnectTimer) return;
    const wait = this.backoffMs;
    this.backoffMs = Math.min(this.backoffMs * 1.6, 15000);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.open();
    }, wait);
  }
}

export const realtimeWs = new RealtimeWsClient();
export const FUSSION_API_ORIGIN = 'https://fussion-api.onrender.com';

/**
 * Session Sync - Multi-tab session synchronization using BroadcastChannel API
 * Ensures logout/login events are synchronized across all browser tabs
 */

const AUTH_CHANNEL = 'auth_session_sync';

type SessionEventType = 'LOGOUT' | 'LOGIN' | 'SESSION_REFRESH';

interface SessionEvent {
    type: SessionEventType;
    payload?: {
        user?: unknown;
        timestamp?: number;
        returnUrl?: string;
    };
}

class SessionSync {
    private channel: BroadcastChannel | null = null;
    private listeners: Map<SessionEventType, Set<(payload?: unknown) => void>> = new Map();

    constructor() {
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
            this.channel = new BroadcastChannel(AUTH_CHANNEL);
            this.channel.onmessage = this.handleMessage.bind(this);
        }
    }

    private handleMessage(event: MessageEvent<SessionEvent>) {
        const { type, payload } = event.data;

        switch (type) {
            case 'LOGOUT':
                if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                    const targetUrl = payload?.returnUrl
                        ? `/login?returnUrl=${payload.returnUrl}`
                        : '/login';
                    window.location.href = targetUrl;
                }
                break;

            case 'LOGIN':
                // No local storage sync for auth state.
                break;

            case 'SESSION_REFRESH':
                // Cookie is already updated by browser.
                break;
        }

        const eventListeners = this.listeners.get(type);
        if (eventListeners) {
            eventListeners.forEach((listener) => listener(payload));
        }
    }

    broadcast(type: SessionEventType, payload?: SessionEvent['payload']) {
        const event: SessionEvent = {
            type,
            payload: {
                ...payload,
                timestamp: Date.now(),
            },
        };

        this.channel?.postMessage(event);
    }

    on(type: SessionEventType, callback: (payload?: unknown) => void) {
        if (!this.listeners.has(type)) {
            this.listeners.set(type, new Set());
        }

        this.listeners.get(type)!.add(callback);
    }

    off(type: SessionEventType, callback: (payload?: unknown) => void) {
        this.listeners.get(type)?.delete(callback);
    }

    destroy() {
        this.channel?.close();
        this.listeners.clear();
    }
}

export const sessionSync = new SessionSync();

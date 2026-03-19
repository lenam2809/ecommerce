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
                // Clear local state and redirect
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('user');
                    // Only redirect if not already on login page
                    if (!window.location.pathname.includes('/login')) {
                        window.location.href = '/login';
                    }
                }
                break;

            case 'LOGIN':
                // Refresh user data if provided
                if (payload?.user && typeof window !== 'undefined') {
                    localStorage.setItem('user', JSON.stringify(payload.user));
                }
                break;

            case 'SESSION_REFRESH':
                // Token refreshed in another tab
                // Cookie is already updated, no action needed
                console.debug('[SessionSync] Token refreshed in another tab');
                break;
        }

        // Notify custom listeners
        const eventListeners = this.listeners.get(type);
        if (eventListeners) {
            eventListeners.forEach(listener => listener(payload));
        }
    }

    /**
     * Broadcast a session event to all other tabs
     */
    broadcast(type: SessionEventType, payload?: SessionEvent['payload']) {
        const event: SessionEvent = {
            type,
            payload: {
                ...payload,
                timestamp: Date.now()
            }
        };
        this.channel?.postMessage(event);
    }

    /**
     * Add a custom listener for session events
     */
    on(type: SessionEventType, callback: (payload?: unknown) => void) {
        if (!this.listeners.has(type)) {
            this.listeners.set(type, new Set());
        }
        this.listeners.get(type)!.add(callback);
    }

    /**
     * Remove a custom listener
     */
    off(type: SessionEventType, callback: (payload?: unknown) => void) {
        this.listeners.get(type)?.delete(callback);
    }

    /**
     * Clean up the broadcast channel
     */
    destroy() {
        this.channel?.close();
        this.listeners.clear();
    }
}

// Singleton instance
export const sessionSync = new SessionSync();

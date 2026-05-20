"use client"

import { logger } from '@/lib/logger'
import { useEffect, useRef, useState, useCallback } from 'react';
import { HubConnectionState } from '@microsoft/signalr';
import SignalRConnectionManager from '@/notifications/signalr-connection-manager';
import { useAuth } from './use-auth';

interface UseSignalROptions {
    hubUrl: string;
    autoConnect?: boolean;
    enabled?: boolean;
    retryDelay?: number;
    reconnectOnAuthChange?: boolean;
}

export interface SignalRNotification<T = unknown> {
    type: string;
    data: T;
}

export function useSignalR<T = unknown>({
    hubUrl,
    autoConnect = true,
    enabled = true,
    retryDelay = 3000,
    reconnectOnAuthChange = true
}: UseSignalROptions) {
    const signalR = useRef(SignalRConnectionManager.getInstance());
    const [connectionState, setConnectionState] = useState<HubConnectionState | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [connectionAttempts, setConnectionAttempts] = useState(0);
    const maxInitialRetries = 3;
    const connectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { isAuthenticated, loading } = useAuth();

    // Hàm kết nối với hub SignalR
    const connect = useCallback(async () => {
        if (!enabled) return;

        try {
            setError(null);
            await signalR.current.startConnection(hubUrl);

            // Không cần set state ở đây vì signalR manager sẽ thông báo qua callback
            setConnectionAttempts(0); // Reset số lần thử kết nối
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to connect to SignalR hub');
            setError(error);

            // Nếu chưa vượt quá số lần thử kết nối, thử lại
            if (connectionAttempts < maxInitialRetries) {
                logger.debug(`SignalR connection attempt ${connectionAttempts + 1} failed, retrying in ${retryDelay}ms...`);
                if (connectTimeoutRef.current) {
                    clearTimeout(connectTimeoutRef.current);
                }

                connectTimeoutRef.current = setTimeout(() => {
                    setConnectionAttempts(prev => prev + 1);
                    connect();
                }, retryDelay);
            }
        }
    }, [enabled, hubUrl, connectionAttempts, retryDelay]);

    // Hàm ngắt kết nối khỏi hub SignalR
    const disconnect = useCallback(async () => {
        try {
            await signalR.current.stopConnection();
            // Không cần set state ở đây vì signalR manager sẽ thông báo qua callback
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to disconnect from SignalR hub'));
        }
    }, []);

    // Hàm thêm listener thông báo
    const addNotificationListener = useCallback(<TData = T>(
        notificationType: string,
        callback: (data: TData) => void
    ) => {
        return signalR.current.addNotificationListener<TData>(notificationType, callback);
    }, []);

    // Đăng ký callback theo dõi thay đổi trạng thái kết nối
    useEffect(() => {
        const unregisterCallback = signalR.current.registerConnectionStateChangeCallback((state) => {
            setConnectionState(state);
        });

        return unregisterCallback;
    }, []);

    useEffect(() => {
        if (!loading && isAuthenticated) {
            connect();    // connect sẽ tự lấy JWT từ authService.getToken()
        }
    }, [loading, isAuthenticated, connect]);

    // Theo dõi thay đổi token xác thực
    useEffect(() => {
        if (!reconnectOnAuthChange) return;

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'auth_token') {
                if (e.newValue) {
                    // Có token mới -> kết nối lại
                    logger.debug('Auth token changed, reconnecting to SignalR...');
                    connect();
                } else {
                    // Token bị xóa -> ngắt kết nối
                    logger.debug('Auth token removed, disconnecting from SignalR...');
                    disconnect();
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [connect, disconnect, reconnectOnAuthChange]);

    // Kết nối với SignalR hub khi component được mount
    useEffect(() => {
        if (enabled && autoConnect) {
            // Đợi một chút để đảm bảo xác thực đã hoàn tất
            const timer = setTimeout(() => {
                connect();
            }, 1500);

            return () => clearTimeout(timer);
        }

        return () => { };
    }, [enabled, autoConnect, connect]);

    // Ngắt kết nối khi component unmount
    useEffect(() => {
        return () => {
            // Dọn dẹp timeout
            if (connectTimeoutRef.current) {
                clearTimeout(connectTimeoutRef.current);
            }

            // Ngắt kết nối nếu cần
            if (enabled) {
                disconnect();
            }
        };
    }, [enabled, disconnect]);

    return {
        connect,
        disconnect,
        addNotificationListener,
        connectionState,
        isConnected: connectionState === HubConnectionState.Connected,
        isConnecting: connectionState === HubConnectionState.Connecting
            || connectionState === HubConnectionState.Reconnecting,
        error,
        retry: connect // Thêm hàm retry để client có thể yêu cầu kết nối lại
    };
}

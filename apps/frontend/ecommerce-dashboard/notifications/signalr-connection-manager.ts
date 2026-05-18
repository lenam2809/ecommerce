import { logger } from '@/lib/logger'
import authService from '@/services/auth-service';
import { HubConnection, HubConnectionBuilder, LogLevel, HubConnectionState, HttpTransportType } from '@microsoft/signalr';

class SignalRConnectionManager {
    private static instance: SignalRConnectionManager;
    private connection: HubConnection | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectInterval = 2000; // Start with 2 seconds
    private listeners: Map<string, Array<(data: any) => void>> = new Map();
    private connectionPromise: Promise<void> | null = null;
    private isConnecting = false;
    private lastHubUrl: string | null = null;
    private connectionStateChangeCallbacks: Array<(state: HubConnectionState | null) => void> = [];

    private constructor() { }

    public static getInstance(): SignalRConnectionManager {
        if (!SignalRConnectionManager.instance) {
            SignalRConnectionManager.instance = new SignalRConnectionManager();
        }
        return SignalRConnectionManager.instance;
    }

    public async startConnection(hubUrl: string): Promise<void> {
        // Lưu lại url hub để dùng cho reconnect
        this.lastHubUrl = hubUrl;

        // Kiểm tra xem đã có kết nối đang chạy chưa
        if (this.isConnecting && this.connectionPromise) {
            return this.connectionPromise;
        }

        // Kiểm tra xem đã kết nối chưa
        if (this.connection && this.connection.state === HubConnectionState.Connected) {
            logger.debug('SignalR connection already established');
            return Promise.resolve();
        }

        this.isConnecting = true;

        // Lưu lại promise kết nối để tránh nhiều request cùng lúc
        this.connectionPromise = this._startConnection(hubUrl);

        try {
            await this.connectionPromise;
        } catch (error) {
            logger.error('Error in startConnection:', error);
        } finally {
            this.isConnecting = false;
            this.connectionPromise = null;
        }
    }

    private async waitForAuth(): Promise<boolean> {
        const maxAttempts = 5;
        const delayMs = 500;

        for (let i = 0; i < maxAttempts; i++) {
            if (authService.isAuthenticated()) return true;
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
        throw new Error("Authentication not available");
    }

    private getCsrfToken(): string | undefined {
        if (typeof document === 'undefined') return undefined;
        const match = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrf_token='));
        return match?.split('=')[1];
    }

    private async _startConnection(hubUrl: string): Promise<void> {
        try {
            // Kiểm tra xác thực có sẵn không (dựa trên user info saved)
            await this.waitForAuth();

            // Hủy kết nối cũ nếu có
            if (this.connection) {
                await this.stopConnection();
            }

            // Use same-origin /api (proxied to backend) for cookie-based auth
            const baseUrl = '/api';
            const fullHubUrl = this.buildUrl(baseUrl, hubUrl);

            logger.debug(`Connecting to SignalR hub at: ${fullHubUrl}`);

            // Xây dựng kết nối SignalR
            const connectionBuilder = new HubConnectionBuilder()
                .withUrl(fullHubUrl, {
                    // Cookie-based auth không cần accessTokenFactory
                    transport: HttpTransportType.WebSockets | HttpTransportType.LongPolling,
                    withCredentials: true, // Quan trọng: Gửi cookie
                    headers: {} // Khởi tạo headers object
                })
                .withAutomaticReconnect({
                    nextRetryDelayInMilliseconds: (retryContext) => {
                        if (retryContext.previousRetryCount <= this.maxReconnectAttempts) {
                            const delay = Math.min(
                                30000,
                                this.reconnectInterval * Math.pow(2, retryContext.previousRetryCount)
                            );
                            return delay + (Math.random() * 1000);
                        }
                        return null;
                    }
                })
                .configureLogging(LogLevel.Information);

            // Thêm CSRF token vào headers nếu có
            const csrfToken = this.getCsrfToken();
            if (csrfToken) {
                // Chúng ta không thể truy cập trực tiếp options.headers từ builder pattern
                // nhưng withUrl chấp nhận IHttpConnectionOptions
                // Vì vậy chúng ta cần build lại object options
                this.connection = new HubConnectionBuilder()
                    .withUrl(fullHubUrl, {
                        transport: HttpTransportType.WebSockets | HttpTransportType.LongPolling,
                        withCredentials: true,
                        headers: {
                            'X-CSRF-Token': csrfToken
                        }
                    })
                    .withAutomaticReconnect() // Re-apply config
                    .configureLogging(LogLevel.Information)
                    .build();
            } else {
                this.connection = connectionBuilder.build();
            }

            // Thiết lập các sự kiện xử lý vòng đời kết nối
            this.connection.onreconnecting((error) => {
                logger.warn('SignalR connection lost, attempting to reconnect...', error);
                this.reconnectAttempts++;
                this.notifyStateChange(HubConnectionState.Reconnecting);
            });

            this.connection.onreconnected((connectionId) => {
                logger.debug('SignalR connection reestablished', connectionId);
                this.reconnectAttempts = 0;
                this.notifyStateChange(HubConnectionState.Connected);
            });

            this.connection.onclose((error) => {
                logger.error('SignalR connection closed', error);
                this.notifyStateChange(HubConnectionState.Disconnected);

                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnectWithBackoff();
                }
            });

            // Bộ thu thông báo cho tất cả các loại thông báo
            this.connection.on('ReceiveNotification', (notificationType, data) => {
                logger.debug(`Received notification: ${notificationType}`, data);

                // Gọi tất cả các hàm xử lý đã đăng ký cho loại thông báo này
                const handlers = this.listeners.get(notificationType) || [];
                handlers.forEach(handler => {
                    try {
                        handler(data);
                    } catch (err) {
                        logger.error(`Error in notification handler for ${notificationType}:`, err);
                    }
                });
            });

            // Bắt đầu kết nối
            await this.connection.start();
            logger.debug('SignalR connection established successfully');
            this.reconnectAttempts = 0;
            this.notifyStateChange(HubConnectionState.Connected);

        } catch (error) {
            logger.error('Error establishing SignalR connection:', error);
            this.notifyStateChange(HubConnectionState.Disconnected);

            // Nếu đây là lần đầu kết nối thất bại, thử lại sau một khoảng thời gian
            if (this.reconnectAttempts === 0) {
                logger.debug('First connection attempt failed, will retry after a delay');
                setTimeout(() => {
                    if (this.lastHubUrl) {
                        this.startConnection(this.lastHubUrl);
                    }
                }, 3000); // Đợi 3 giây trước khi thử lại
            } else if (this.reconnectAttempts < this.maxReconnectAttempts) {
                this.reconnectWithBackoff();
            }

            this.reconnectAttempts++;
            throw error;
        }
    }

    private buildUrl(baseUrl: string, hubUrl: string): string {
        if (!baseUrl) return hubUrl;

        // Loại bỏ dấu "/" trùng lặp giữa baseUrl và hubUrl
        const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        const cleanHubUrl = hubUrl.startsWith('/') ? hubUrl : `/${hubUrl}`;

        return `${cleanBaseUrl}${cleanHubUrl}`;
    }

    private reconnectWithBackoff(): void {
        if (!this.lastHubUrl) return;

        // Thêm random delay để tránh thử kết nối đồng loạt
        const jitter = Math.random() * 2000;

        const delay = Math.min(
            30000,
            this.reconnectInterval * Math.pow(2, this.reconnectAttempts) + jitter
        );

        logger.debug(`Attempting to reconnect in ${delay / 1000} seconds...`);

        setTimeout(async () => {
            try {
                await this.startConnection(this.lastHubUrl!);
            } catch (error) {
                logger.error('Reconnect failed:', error);
            }
        }, delay);
    }

    public async stopConnection(): Promise<void> {
        if (this.connection && this.connection.state !== HubConnectionState.Disconnected) {
            try {
                await this.connection.stop();
                logger.debug('SignalR connection stopped');
                this.notifyStateChange(HubConnectionState.Disconnected);
            } catch (error) {
                logger.error('Error stopping SignalR connection:', error);
            }
        }
    }

    public addNotificationListener<T>(notificationType: string, callback: (data: T) => void): () => void {
        if (!this.listeners.has(notificationType)) {
            this.listeners.set(notificationType, []);
        }

        const handlers = this.listeners.get(notificationType)!;
        handlers.push(callback as (data: any) => void);

        // Trả về một hàm để xóa listener này
        return () => {
            const index = handlers.indexOf(callback as (data: any) => void);
            if (index !== -1) {
                handlers.splice(index, 1);
            }
        };
    }

    public registerConnectionStateChangeCallback(callback: (state: HubConnectionState | null) => void): () => void {
        this.connectionStateChangeCallbacks.push(callback);

        // Gọi callback ngay lập tức với trạng thái hiện tại
        callback(this.getConnectionState());

        // Trả về hàm để hủy đăng ký
        return () => {
            const index = this.connectionStateChangeCallbacks.indexOf(callback);
            if (index !== -1) {
                this.connectionStateChangeCallbacks.splice(index, 1);
            }
        };
    }

    private notifyStateChange(state: HubConnectionState): void {
        this.connectionStateChangeCallbacks.forEach(callback => {
            try {
                callback(state);
            } catch (err) {
                logger.error('Error in connection state change callback:', err);
            }
        });
    }

    public getConnectionState(): HubConnectionState | null {
        return this.connection?.state || null;
    }

    public isConnected(): boolean {
        return this.connection?.state === HubConnectionState.Connected;
    }
}

export default SignalRConnectionManager;
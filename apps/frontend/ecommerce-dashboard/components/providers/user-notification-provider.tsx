"use client"

import { FC, ReactNode, useEffect, useState } from 'react';
import { useSignalR } from '@/hooks/use-signalr';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { userKeys } from '@/hooks/use-users';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { HubConnectionState } from '@microsoft/signalr';

interface UserNotificationProviderProps {
    children: ReactNode;
}

interface UserRegisteredNotification {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    timestamp: string;
}

export const UserNotificationProvider: FC<UserNotificationProviderProps> = ({ children }) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const router = useRouter();
    const [isInitialized, setIsInitialized] = useState(false);

    // Chỉ bật thông báo cho người dùng đã xác thực có vai trò admin
    const isAdmin = user?.roles?.includes('Admin');
    const isAuthenticated = !!user;

    // Sử dụng hook SignalR cải tiến
    const {
        addNotificationListener,
        connectionState,
        isConnecting
    } = useSignalR({
        hubUrl: '/notification-hub',
        enabled: isAuthenticated && isAdmin,
        // Tự động kết nối chỉ khi đã xác thực
        autoConnect: isAuthenticated && isAdmin,
        // Đợi lâu hơn cho lần đầu kết nối để đảm bảo token đã được thiết lập
        retryDelay: 3000,
        // Kết nối lại khi token thay đổi
        reconnectOnAuthChange: true
    });

    // Theo dõi trạng thái kết nối và hiển thị toast thông báo khi cần
    useEffect(() => {
        // Chỉ xử lý khi đã khởi tạo và người dùng có quyền
        if (!isInitialized || !isAdmin || !isAuthenticated) return;

        // Hiển thị toast khi kết nối bị mất
        if (connectionState === HubConnectionState.Disconnected && isInitialized) {
            console.warn('SignalR connection disconnected. Notifications may be delayed.');

            // Có thể thêm toast thông báo kết nối bị mất nếu cần
            /*
            toast({
                title: 'Thông báo',
                description: 'Kết nối tới hệ thống thông báo bị gián đoạn. Đang thử kết nối lại...',
                variant: 'destructive',
                duration: 3000
            });
            */
        }

        // Hiển thị toast khi kết nối thành công sau khi bị mất
        if (connectionState === HubConnectionState.Connected && isInitialized) {
            console.log('SignalR connection established. Notifications working normally.');

            // Có thể thêm toast thông báo kết nối thành công nếu cần
            toast({
                title: 'Thông báo',
                description: 'Đã kết nối lại với hệ thống thông báo.',
                duration: 3000
            });
        }
    }, [connectionState, isInitialized, isAdmin, isAuthenticated]);

    // Đăng ký lắng nghe thông báo đăng ký người dùng mới
    useEffect(() => {
        // Đánh dấu đã được khởi tạo
        if (!isInitialized && isAuthenticated) {
            setIsInitialized(true);
        }

        if (!isAdmin || !isAuthenticated) return;

        // Đăng ký lắng nghe thông báo đăng ký người dùng mới
        const removeListener = addNotificationListener<UserRegisteredNotification>(
            'UserRegistered',
            (data) => {
                // Hiển thị toast thông báo
                toast({
                    title: 'Đăng ký người dùng mới',
                    description: `${data.firstName} ${data.lastName} (${data.email}) đã đăng ký với vai trò ${data.role}`,
                    duration: 5000,
                    action: (
                        <button
                            onClick={() => router.push(`/users/${data.userId}`)}
                            className="px-3 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md"
                        >
                            Xem hồ sơ
                        </button>
                    )
                });

                // Làm mới danh sách người dùng
                queryClient.invalidateQueries({ queryKey: userKeys.all });
            }
        );

        // Dọn dẹp listener khi component unmount
        return () => {
            removeListener();
        };
    }, [addNotificationListener, queryClient, router, isAdmin, isAuthenticated, isInitialized]);

    // Có thể thêm UI indicator nếu muốn hiển thị trạng thái kết nối
    return (
        <>
            {children}
            {isAuthenticated && isAdmin && isConnecting && (
                <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-md text-sm opacity-75 z-50 shadow-md">
                    Đang kết nối với hệ thống thông báo...
                </div>
            )}
        </>
    );
};

export default UserNotificationProvider;
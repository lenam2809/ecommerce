"use client";

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { showroomService } from '@/services/showroom-service';
import {
    CreateShowroomDto,
    UpdateShowroomDto,
    UpdateShowroomInventoryDto,
    StockTransferRequest,
    ShowroomFilterParams
} from '@/types/showroom';
import { toast } from './use-toast';
import { handleApiError } from '@/lib/api-error';

export const showroomKeys = {
    all: ['showrooms'] as const,
    admin: (params?: ShowroomFilterParams) => [...showroomKeys.all, 'admin', params] as const,
    detail: (id: string) => [...showroomKeys.all, 'detail', id] as const,
    inventory: (id: string, search?: string) => [...showroomKeys.all, 'inventory', id, search] as const,
};

export const useGetAdminShowrooms = (params?: ShowroomFilterParams) => {
    return useQuery({
        queryKey: showroomKeys.admin(params),
        queryFn: () => showroomService.getAdminShowrooms(params),
        staleTime: 1000 * 60 * 2,
    });
};

export const useGetShowroomInventory = (showroomId: string, search?: string) => {
    return useQuery({
        queryKey: showroomKeys.inventory(showroomId, search),
        queryFn: () => showroomService.getShowroomInventory(showroomId, search),
        enabled: Boolean(showroomId),
        staleTime: 1000 * 30, // 30s cache cho tồn kho O2O
    });
};

export const useCreateShowroom = (onSuccessCallback?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateShowroomDto) => showroomService.createShowroom(data),
        onSuccess: (res) => {
            if (res.success) {
                toast({
                    title: "Thêm Showroom thành công",
                    description: `Đã bổ sung cơ sở ${res.data?.name ?? ''} vào hệ thống.`,
                });
                queryClient.invalidateQueries({ queryKey: showroomKeys.all });
                onSuccessCallback?.();
            } else {
                toast({
                    title: "Không thể thêm showroom",
                    description: res.error || "Đã xảy ra lỗi không xác định.",
                    variant: "destructive",
                });
            }
        },
        onError: (error: unknown) => {
            handleApiError({
                error,
                context: { operation: 'createShowroom' },
                devTitle: 'Lỗi thêm showroom',
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            });
        }
    });
};

export const useUpdateShowroom = (onSuccessCallback?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateShowroomDto) => showroomService.updateShowroom(data.id, data),
        onSuccess: (res, variables) => {
            if (res.success) {
                toast({
                    title: "Cập nhật Showroom thành công",
                    description: `Đã cập nhật thông tin cơ sở ${variables.name}.`,
                });
                queryClient.invalidateQueries({ queryKey: showroomKeys.all });
                queryClient.invalidateQueries({ queryKey: showroomKeys.detail(variables.id) });
                onSuccessCallback?.();
            } else {
                toast({
                    title: "Không thể cập nhật showroom",
                    description: res.error || "Đã xảy ra lỗi không xác định.",
                    variant: "destructive",
                });
            }
        },
        onError: (error: unknown) => {
            handleApiError({
                error,
                context: { operation: 'updateShowroom' },
                devTitle: 'Lỗi cập nhật showroom',
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            });
        }
    });
};

export const useDeleteShowroom = (onSuccessCallback?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => showroomService.deleteShowroom(id),
        onSuccess: (res) => {
            if (res.success) {
                toast({
                    title: "Xóa Showroom thành công",
                    description: "Đã chuyển trạng thái cơ sở sang ngừng hoạt động.",
                });
                queryClient.invalidateQueries({ queryKey: showroomKeys.all });
                onSuccessCallback?.();
            } else {
                toast({
                    title: "Không thể xóa showroom",
                    description: res.error || "Đã xảy ra lỗi không xác định.",
                    variant: "destructive",
                });
            }
        },
        onError: (error: unknown) => {
            handleApiError({
                error,
                context: { operation: 'deleteShowroom' },
                devTitle: 'Lỗi xóa showroom',
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            });
        }
    });
};

export const useUpdateShowroomInventory = (showroomId: string, onSuccessCallback?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateShowroomInventoryDto) =>
            showroomService.updateShowroomInventory(showroomId, data),
        onSuccess: (res) => {
            if (res.success) {
                toast({
                    title: "Cập nhật tồn kho thành công",
                    description: `Đã cập nhật số lượng tồn cho ${res.data?.productName ?? 'sản phẩm'}.`,
                });
                queryClient.invalidateQueries({ queryKey: showroomKeys.inventory(showroomId) });
                queryClient.invalidateQueries({ queryKey: showroomKeys.all });
                onSuccessCallback?.();
            } else {
                toast({
                    title: "Không thể cập nhật tồn kho",
                    description: res.error || "Đã xảy ra lỗi.",
                    variant: "destructive",
                });
            }
        },
        onError: (error: unknown) => {
            handleApiError({
                error,
                context: { operation: 'updateShowroomInventory' },
                devTitle: 'Lỗi cập nhật tồn kho',
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            });
        }
    });
};

export const useTransferStock = (fromShowroomId: string, onSuccessCallback?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: StockTransferRequest) => showroomService.transferStock(data),
        onSuccess: (res) => {
            if (res.success) {
                toast({
                    title: "Điều chuyển kho thành công",
                    description: "Hàng hóa đã được điều chuyển giữa 2 cơ sở an toàn.",
                });
                queryClient.invalidateQueries({ queryKey: showroomKeys.inventory(fromShowroomId) });
                queryClient.invalidateQueries({ queryKey: showroomKeys.all });
                onSuccessCallback?.();
            } else {
                toast({
                    title: "Lỗi điều chuyển kho",
                    description: res.error || "Không thể thực hiện điều chuyển tồn kho.",
                    variant: "destructive",
                });
            }
        },
        onError: (error: unknown) => {
            handleApiError({
                error,
                context: { operation: 'transferStock' },
                devTitle: 'Lỗi điều chuyển kho',
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            });
        }
    });
};

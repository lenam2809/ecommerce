"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { promoCodeService } from '@/services/promo-code-service';
import { CreatePromoCodeDto, UpdatePromoCodeDto } from '@/schemas/promo-code/promo-code-schema';
import { toast } from './use-toast';
import { handleApiError } from '@/lib/api-error';

// Key factory cho quản lý cache hiệu quả
const promoCodeKeys = {
    all: ['promo-codes'] as const,
    active: () => [...promoCodeKeys.all, 'active'] as const,
    lists: () => [...promoCodeKeys.all, 'list'] as const,
    list: (params: any) => [...promoCodeKeys.lists(), params] as const,
    details: () => [...promoCodeKeys.all, 'detail'] as const,
    detail: (id: string) => [...promoCodeKeys.details(), id] as const,
};

export const useGetPromoCodes = (params: any = {}) => {
    return useQuery({
        queryKey: promoCodeKeys.list(params),
        queryFn: () => promoCodeService.getAllPromoCodes(params),
        staleTime: 1000 * 60 * 5, // 5 phút
    });
};

export const useGetActivePromoCodes = () => {
    return useQuery({
        queryKey: promoCodeKeys.active(),
        queryFn: () => promoCodeService.getActivePromoCodes(),
        staleTime: 1000 * 60 * 5, // 5 phút
    });
};

export const useGetPromoCode = (id: string) => {
    return useQuery({
        queryKey: promoCodeKeys.detail(id),
        queryFn: () => promoCodeService.getPromoCodeById(id),
        enabled: !!id, // Chỉ chạy query khi có id
        staleTime: 1000 * 60 * 5, // 5 phút
    });
};

export const useCreatePromoCode = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (promoCodeData: CreatePromoCodeDto) => promoCodeService.createPromoCode(promoCodeData),
        onSuccess: () => {
            toast({
                title: "Thêm mới mã khuyến mãi",
                description: `Thêm mới mã khuyến mãi thành công!`,
            })
            // Invalidate và refetch
            queryClient.invalidateQueries({ queryKey: promoCodeKeys.all });
            queryClient.invalidateQueries({ queryKey: promoCodeKeys.lists() });
            queryClient.invalidateQueries({ queryKey: promoCodeKeys.active() });
            router.push('/configs/promo-codes');
        },
        onError: (error: any) => {
            handleApiError({
                error,
                context: { operation: 'createPromoCode' },
                devTitle: 'Lỗi',
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            })
        }
    });
};

export const useUpdatePromoCode = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (promoCodeData: UpdatePromoCodeDto) => promoCodeService.updatePromoCode(promoCodeData.id, promoCodeData),
        onSuccess: (data, variables) => {
            toast({
                title: "Cập nhật mã khuyến mãi",
                description: 'Cập nhật mã khuyến mãi thành công!',
            })
            // Cập nhật cache cho cả danh sách và chi tiết mã khuyến mãi
            queryClient.invalidateQueries({ queryKey: promoCodeKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: promoCodeKeys.all });
            queryClient.invalidateQueries({ queryKey: promoCodeKeys.active() });
            router.push('/configs/promo-codes');
        },
        onError: (error: any) => {
            handleApiError({
                error,
                context: { operation: 'updatePromoCode' },
                devTitle: 'Lỗi',
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            })
        }
    });
};

export const useDeletePromoCode = (onSuccessCallback?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => promoCodeService.deletePromoCode(id),
        onSuccess: (_, variables) => {
            toast({
                title: "Xóa mã khuyến mãi",
                description: 'Xóa mã khuyến mãi thành công!',
            })
            // Invalidate và refetch
            queryClient.invalidateQueries({ queryKey: promoCodeKeys.all });
            queryClient.invalidateQueries({ queryKey: promoCodeKeys.lists() });
            queryClient.invalidateQueries({ queryKey: promoCodeKeys.active() });
            if (onSuccessCallback) {
                onSuccessCallback();
            }
        },
        onError: (error: any) => {
            handleApiError({
                error,
                context: { operation: 'deletePromoCode' },
                devTitle: 'Lỗi',
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            })
        }
    });
};

export const useApplyPromoCode = () => {
    return useMutation({
        mutationFn: ({ code, cartId }: { code: string, cartId: string }) =>
            promoCodeService.applyPromoCode(code, cartId),
        onSuccess: () => {
            toast({
                title: "Áp dụng mã khuyến mãi",
                description: 'Áp dụng mã khuyến mãi thành công!',
            })
        },
        onError: (error: any) => {
            handleApiError({
                error,
                context: { operation: 'applyPromoCode' },
                devTitle: 'Lỗi',
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            })
        }
    });
};
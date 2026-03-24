"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { bannerService } from '@/services/banner-service';
import { CreateBannerDto, UpdateBannerDto } from '@/schemas/banner/banner-schema';
import { toast } from './use-toast';
import { handleApiError } from '@/lib/api-error';

// Key factory cho quản lý cache hiệu quả
const bannerKeys = {
    all: ['banners'] as const,
    lists: () => [...bannerKeys.all, 'list'] as const,
    list: (params: any) => [...bannerKeys.lists(), params] as const,
    details: () => [...bannerKeys.all, 'detail'] as const,
    detail: (id: string) => [...bannerKeys.details(), id] as const,
};

export const useGetBanners = (params: any = {}) => {
    return useQuery({
        queryKey: bannerKeys.list(params),
        queryFn: () => bannerService.getAllBanners(params),
        staleTime: 1000 * 60 * 5, // 5 phút
    });
};

export const useGetBanner = (id: string) => {
    return useQuery({
        queryKey: bannerKeys.detail(id),
        queryFn: () => bannerService.getBannerById(id),
        enabled: !!id, // Chỉ chạy query khi có id
        staleTime: 1000 * 60 * 5, // 5 phút
    });
};

export const useCreateBanner = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (bannerData: CreateBannerDto) => bannerService.createBanner(bannerData),
        onSuccess: () => {
            toast({
                title: "Thêm mới banner",
                description: `Thêm mới banner thành công!`,
            })
            // Invalidate và refetch
            queryClient.invalidateQueries({ queryKey: bannerKeys.all });
            router.push('/configs/banners');
        },
        onError: (error: any) => {
            handleApiError({
                error,
                context: { operation: 'createBanner' },
                devTitle: 'Lỗi',
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            })
        }
    });
};

export const useUpdateBanner = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (bannerData: UpdateBannerDto) => bannerService.updateBanner(bannerData.id, bannerData),
        onSuccess: (data, variables) => {
            toast({
                title: "Cập nhật banner",
                description: 'Cập nhật banner thành công!',
            })
            // Cập nhật cache cho cả danh sách và chi tiết banner
            queryClient.invalidateQueries({ queryKey: bannerKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: bannerKeys.all });
            router.push('/configs/banners');
        },
        onError: (error: any) => {
            handleApiError({
                error,
                context: { operation: 'updateBanner' },
                devTitle: 'Lỗi',
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            })
        }
    });
};

export const useDeleteBanner = (onSuccessCallback?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => bannerService.deleteBanner(id),
        onSuccess: (_, variables) => {
            toast({
                title: "Xóa banner",
                description: 'Xóa banner thành công!',
            })
            // Invalidate và refetch
            queryClient.invalidateQueries({ queryKey: bannerKeys.lists() });
            if (onSuccessCallback) {
                onSuccessCallback();
            }
        },
        onError: (error: any) => {
            handleApiError({
                error,
                context: { operation: 'deleteBanner' },
                devTitle: 'Lỗi',
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            })
        }
    });
};
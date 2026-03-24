"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { brandService } from '@/services/brand-service';
import { CreateBrandDto, UpdateBrandDto } from '@/schemas/brand';
import { OptionType } from '@/components/ui/select/single-select';
import { toast } from './use-toast';
import { handleApiError } from '@/lib/api-error';

// Key factory cho quản lý cache hiệu quả
const brandKeys = {
    all: ['brands'] as const,
    options: ['options/brands'] as const,
    lists: () => [...brandKeys.all, 'list'] as const,
    list: (params: any) => [...brandKeys.lists(), params] as const,
    details: () => [...brandKeys.all, 'detail'] as const,
    detail: (id: string) => [...brandKeys.details(), id] as const,
    withProducts: () => [...brandKeys.all, 'with-products'] as const,
};

export const useGetBrands = (params: any = {}) => {
    return useQuery({
        queryKey: brandKeys.list(params),
        queryFn: () => brandService.getAllBrands(params),
        staleTime: 1000 * 60 * 5, // 5 phút
    });
};

export const useGetOptionBrands = () => {
    return useQuery({
        queryKey: brandKeys.options,
        queryFn: () => brandService.getOptions<OptionType>(),
        staleTime: 1000 * 60 * 5, // 5 phút
    });
};

export const useGetBrand = (id: string) => {
    return useQuery({
        queryKey: brandKeys.detail(id),
        queryFn: () => brandService.getBrandById(id),
        enabled: !!id, // Chỉ chạy query khi có id
        staleTime: 1000 * 60 * 5, // 5 phút
    });
};


export const useCreateBrand = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (brandData: CreateBrandDto) => brandService.createBrand(brandData),
        onSuccess: () => {
            toast({
                title: "Thêm mới thương hiệu",
                description: `Thêm mới thương hiệu thành công!`,
            })
            // Invalidate và refetch
            queryClient.invalidateQueries({ queryKey: brandKeys.all });
            router.push('/brands');
        },
        onError: (error: any) => {
            handleApiError({
                error,
                context: { operation: 'createBrand' },
                devTitle: 'Lỗi',
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            })
        }
    });
};

export const useUpdateBrand = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (brandData: UpdateBrandDto) => brandService.updateBrand(brandData.id, brandData),
        onSuccess: (data, variables) => {
            toast({
                title: "Cập nhật thương hiệu",
                description: 'Cập nhật thương hiệu thành công!',
            })
            // Cập nhật cache cho cả danh sách và chi tiết thương hiệu
            queryClient.invalidateQueries({ queryKey: brandKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: brandKeys.all });
            router.push('/brands');
        },
        onError: (error: any) => {
            handleApiError({
                error,
                context: { operation: 'updateBrand' },
                devTitle: 'Lỗi',
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            })
        }
    });
};

export const useDeleteBrand = (onSuccessCallback?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => brandService.deleteBrand(id),
        onSuccess: (_, variables) => {
            toast({
                title: "Xóa thương hiệu",
                description: 'Xóa thương hiệu thành công!',
            })
            // Invalidate và refetch
            queryClient.invalidateQueries({ queryKey: brandKeys.all });
            if (onSuccessCallback) {
                onSuccessCallback();
            }
        },
        onError: (error: any) => {
            handleApiError({
                error,
                context: { operation: 'deleteBrand' },
                devTitle: 'Lỗi',
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            })
        }
    });
};
"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { categoryService } from '@/services/category-service';
import { CreateCategoryDto, UpdateCategoryDto } from '@/schemas/category';
import { OptionGroupType, OptionType } from '@/components/ui/select/single-select';
import { toast } from './use-toast';
import { handleApiError } from '@/lib/api-error';

// Key factory cho quản lý cache hiệu quả
const categoryKeys = {
    all: ['categories'] as const,
    options: ['categories/options'] as const,
    optionGroups: (includeChildren?: boolean) => ['options/categories', includeChildren] as const,
    lists: () => [...categoryKeys.all, 'list'] as const,
    list: (params: any) => [...categoryKeys.lists(), params] as const,
    details: () => [...categoryKeys.all, 'detail'] as const,
    detail: (id: string) => [...categoryKeys.details(), id] as const,
    withProducts: () => [...categoryKeys.all, 'with-products'] as const,
    byBrandId: (id: string) => [...categoryKeys.all, 'by-brand', id] as const,
};

export const useGetCategories = (params: any = {}) => {
    return useQuery({
        queryKey: categoryKeys.list(params),
        queryFn: () => categoryService.getAllCategories(params),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    });
};

export const useGetOptionCategories = () => {
    return useQuery({
        queryKey: categoryKeys.options,
        queryFn: () => categoryService.getOptions<OptionType>(),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    });
};

export const useGetOptionGroupCategories = (includeChildren?: boolean) => {
    return useQuery({
        queryKey: categoryKeys.optionGroups(includeChildren),
        queryFn: () => categoryService.getOptions<OptionGroupType>(includeChildren),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    });
};

export const useGetCategory = (id: string) => {
    return useQuery({
        queryKey: categoryKeys.detail(id),
        queryFn: () => categoryService.getCategoryById(id),
        enabled: !!id, // Chỉ chạy query khi có id
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    });
};

export const useGetCategoriesByBrandId = (id: string) => {
    return useQuery({
        queryKey: categoryKeys.byBrandId(id),
        queryFn: () => categoryService.getCategoriesByBrandId(id),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    });
};


export const useCreateCategory = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (categoryData: CreateCategoryDto) => categoryService.createCategory(categoryData),
        onSuccess: () => {
            toast({
                title: "Thêm mới danh mục",
                description: 'Thêm mới danh mục thành công!',
            })
            // Invalidate và refetch
            queryClient.invalidateQueries({ queryKey: categoryKeys.all });
            router.push('/categories');
        },
        onError: (error: unknown) => {
            handleApiError({
                error,
                context: { operation: 'createCategory' },
                devTitle: 'Lỗi',
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            })
        }
    });
};

export const useUpdateCategory = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (categoryData: UpdateCategoryDto) => categoryService.updateCategory(categoryData),
        onSuccess: () => {
            toast({
                title: "Cập nhật danh mục",
                description: 'Cập nhật danh mục thành công!',
            })
            // Cập nhật cache cho cả danh sách và chi tiết danh mục
            queryClient.invalidateQueries({ queryKey: categoryKeys.all });
            router.push('/categories');
        },
        onError: (error: unknown) => {
            handleApiError({
                error,
                context: { operation: 'updateCategory' },
                devTitle: 'Lỗi',
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            })
        }
    });
};

export const useDeleteCategory = (onSuccessCallback?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => categoryService.deleteCategory(id),
        onSuccess: () => {
            toast({
                title: "Xóa danh mục",
                description: 'Xóa danh mục thành công!',
            })
            // Invalidate và refetch
            queryClient.invalidateQueries({ queryKey: categoryKeys.all });
            if (onSuccessCallback) {
                onSuccessCallback();
            }
        },
        onError: (error: unknown) => {
            handleApiError({
                error,
                context: { operation: 'deleteCategory' },
                devTitle: 'Lỗi',
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            })
        }
    });
};

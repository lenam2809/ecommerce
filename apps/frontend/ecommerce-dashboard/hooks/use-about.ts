"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { aboutService } from '@/services/about-service';
import { AboutDto } from '@/types/about';
import { toast } from './use-toast';
import { handleApiError } from '@/lib/api-error';

const aboutKeys = {
    all: ['about'] as const,
    lists: () => [...aboutKeys.all, 'list'] as const,
    list: (params: any) => [...aboutKeys.lists(), params] as const,
    details: () => [...aboutKeys.all, 'detail'] as const,
    detail: (id: string) => [...aboutKeys.details(), id] as const,
};

export const useGetAboutSections = () => {
    return useQuery({
        queryKey: aboutKeys.lists(),
        queryFn: () => aboutService.getAllAboutSections(),
        staleTime: 1000 * 60 * 5, // 5 phút
    });
};

export const useGetAboutSection = (id: string) => {
    return useQuery({
        queryKey: aboutKeys.detail(id),
        queryFn: () => aboutService.getAboutSectionById(id),
        enabled: !!id,
        staleTime: 1000 * 60 * 5,
    });
};

export const useCreateAboutSection = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (aboutData: AboutDto) => aboutService.createAboutSection(aboutData),
        onSuccess: (data) => {
            toast({
                title: "Tạo mới About Section",
                description: "Tạo mới About Section thành công!",
            });
            queryClient.invalidateQueries({ queryKey: aboutKeys.all });
            router.push('/about');
        },
        onError: (error: any) => {
            handleApiError({
                error,
                context: { operation: 'createAboutSection' },
                devTitle: 'Lỗi',
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            })
        }
    });
};

export const useUpdateAboutSection = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: AboutDto }) =>
            aboutService.updateAboutSection(id, data),
        onSuccess: (_, variables) => {
            toast({
                title: "Cập nhật About Section",
                description: "Cập nhật About Section thành công!",
            });
            queryClient.invalidateQueries({ queryKey: aboutKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: aboutKeys.lists() });
        },
        onError: (error: any) => {
            handleApiError({
                error,
                context: { operation: 'updateAboutSection' },
                devTitle: 'Lỗi',
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            })
        }
    });
};

export const useUpdateAboutStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, isActive }: { id: string, isActive: boolean }) =>
            aboutService.updateAboutStatus(id, isActive),
        onSuccess: (_, variables) => {
            const action = variables.isActive ? "kích hoạt" : "hủy kích hoạt";
            toast({
                title: "Cập nhật trạng thái About Section",
                description: `Đã ${action} About Section thành công!`,
            });
            queryClient.invalidateQueries({ queryKey: aboutKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: aboutKeys.lists() });
        },
        onError: (error: any) => {
            handleApiError({
                error,
                context: { operation: 'updateAboutStatus' },
                devTitle: 'Lỗi',
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            })
        }
    });
};

export const useDeleteAboutSection = (onSuccessCallback?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => aboutService.deleteAboutSection(id),
        onSuccess: (_, variables) => {
            toast({
                title: "Xóa About Section",
                description: "Xóa About Section thành công!",
            });
            queryClient.invalidateQueries({ queryKey: aboutKeys.lists() });
            if (onSuccessCallback) onSuccessCallback();
        },
        onError: (error: any) => {
            handleApiError({
                error,
                context: { operation: 'deleteAboutSection' },
                devTitle: 'Lỗi',
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            })
        }
    });
};
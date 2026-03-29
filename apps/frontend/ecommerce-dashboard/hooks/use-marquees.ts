"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { marqueeService } from '@/services/marquee-service';
import { CreateMarqueeDto, UpdateMarqueeDto } from '@/schemas/marquee/marquee-schema';
import { toast } from './use-toast';
import { handleApiError } from '@/lib/api-error';

const marqueeKeys = {
    all: ['marquees'] as const,
    lists: () => [...marqueeKeys.all, 'list'] as const,
    list: (params: any) => [...marqueeKeys.lists(), params] as const,
    details: () => [...marqueeKeys.all, 'detail'] as const,
    detail: (id: string) => [...marqueeKeys.details(), id] as const,
};

export const useGetMarquees = () => {
    return useQuery({
        queryKey: marqueeKeys.lists(),
        queryFn: () => marqueeService.getAllMarquees(),
        staleTime: 1000 * 60 * 5,
    });
};

export const useCreateMarquee = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateMarqueeDto) => marqueeService.createMarquee(data),
        onSuccess: () => {
            toast({
                title: "Thêm mới tin nhắn marquee",
                description: "Thêm mới tin nhắn marquee thành công!",
            });
            queryClient.invalidateQueries({ queryKey: marqueeKeys.all });
            router.push('/configs/marquee');
        },
        onError: (error: any) => {
            handleApiError({
                error,
                context: { operation: 'createMarquee' },
                devTitle: 'Lỗi',
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            });
        },
    });
};

export const useUpdateMarquee = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateMarqueeDto) => marqueeService.updateMarquee(data.id, data),
        onSuccess: (_, variables) => {
            toast({
                title: "Cập nhật tin nhắn marquee",
                description: "Cập nhật tin nhắn marquee thành công!",
            });
            queryClient.invalidateQueries({ queryKey: marqueeKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: marqueeKeys.all });
            router.push('/configs/marquee');
        },
        onError: (error: any) => {
            handleApiError({
                error,
                context: { operation: 'updateMarquee' },
                devTitle: 'Lỗi',
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            });
        },
    });
};

export const useDeleteMarquee = (onSuccessCallback?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => marqueeService.deleteMarquee(id),
        onSuccess: () => {
            toast({
                title: "Xóa tin nhắn marquee",
                description: "Xóa tin nhắn marquee thành công!",
            });
            queryClient.invalidateQueries({ queryKey: marqueeKeys.all });
            queryClient.invalidateQueries({ queryKey: marqueeKeys.lists() });
            if (onSuccessCallback) onSuccessCallback();
        },
        onError: (error: any) => {
            handleApiError({
                error,
                context: { operation: 'deleteMarquee' },
                devTitle: 'Lỗi',
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            });
        },
    });
};

export const useToggleMarquee = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => marqueeService.toggleMarquee(id),
        onSuccess: () => {
            toast({
                title: "Thay đổi trạng thái",
                description: "Thay đổi trạng thái tin nhắn thành công!",
            });
            queryClient.invalidateQueries({ queryKey: marqueeKeys.all });
        },
        onError: (error: any) => {
            handleApiError({
                error,
                context: { operation: 'toggleMarquee' },
                devTitle: 'Lỗi',
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            });
        },
    });
};

export const useToggleGlobalMarquee = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => marqueeService.toggleGlobalMarquee(),
        onSuccess: () => {
            toast({
                title: "Thay đổi trạng thái toàn cục",
                description: "Thay đổi trạng thái thanh marquee thành công!",
            });
            queryClient.invalidateQueries({ queryKey: marqueeKeys.all });
        },
        onError: (error: any) => {
            handleApiError({
                error,
                context: { operation: 'toggleGlobalMarquee' },
                devTitle: 'Lỗi',
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            });
        },
    });
};

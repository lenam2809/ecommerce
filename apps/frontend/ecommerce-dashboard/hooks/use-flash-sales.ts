"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { flashSaleService } from '@/services/flash-sale-service';
import { CreateFlashSaleInput, UpdateFlashSaleInput } from '@/types/flash-sale';
import { toast } from './use-toast';

export const flashSaleKeys = {
    all: ['flash-sales'] as const,
    lists: () => [...flashSaleKeys.all, 'list'] as const,
    list: (params: any) => [...flashSaleKeys.lists(), params] as const,
    details: () => [...flashSaleKeys.all, 'detail'] as const,
    detail: (id: string) => [...flashSaleKeys.details(), id] as const,
    current: () => [...flashSaleKeys.all, 'current'] as const,
};

export const useGetFlashSales = (params: { isActive?: boolean } = {}) => {
    return useQuery({
        queryKey: flashSaleKeys.list(params),
        queryFn: () => flashSaleService.getAllFlashSales(params),
        staleTime: 1000 * 30, // 30s
    });
};

export const useGetFlashSale = (id: string) => {
    return useQuery({
        queryKey: flashSaleKeys.detail(id),
        queryFn: () => flashSaleService.getFlashSaleById(id),
        enabled: !!id,
        staleTime: 1000 * 60,
    });
};

export const useGetCurrentFlashSale = () => {
    return useQuery({
        queryKey: flashSaleKeys.current(),
        queryFn: () => flashSaleService.getCurrentFlashSale(),
        staleTime: 1000 * 15,
    });
};

export const useCreateFlashSale = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateFlashSaleInput) => flashSaleService.createFlashSale(data),
        onSuccess: (result) => {
            if (result.success) {
                toast({
                    title: "Thành công",
                    description: "Đã tạo mới chiến dịch Flash Sale thành công!",
                });
                queryClient.invalidateQueries({ queryKey: flashSaleKeys.all });
                router.push('/configs/flash-sales');
            } else {
                toast({
                    title: "Lỗi",
                    description: result.error || "Không thể tạo chiến dịch Flash Sale.",
                    variant: "destructive",
                });
            }
        },
        onError: (err: any) => {
            toast({
                title: "Lỗi",
                description: err?.response?.data?.error || err.message || "Có lỗi xảy ra khi tạo chiến dịch.",
                variant: "destructive",
            });
        },
    });
};

export const useUpdateFlashSale = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateFlashSaleInput }) =>
            flashSaleService.updateFlashSale(id, data),
        onSuccess: (result, variables) => {
            if (result.success) {
                toast({
                    title: "Thành công",
                    description: "Đã cập nhật chiến dịch Flash Sale thành công!",
                });
                queryClient.invalidateQueries({ queryKey: flashSaleKeys.all });
                queryClient.invalidateQueries({ queryKey: flashSaleKeys.detail(variables.id) });
                router.push('/configs/flash-sales');
            } else {
                toast({
                    title: "Lỗi",
                    description: result.error || "Không thể cập nhật chiến dịch Flash Sale.",
                    variant: "destructive",
                });
            }
        },
        onError: (err: any) => {
            toast({
                title: "Lỗi",
                description: err?.response?.data?.error || err.message || "Có lỗi xảy ra khi cập nhật chiến dịch.",
                variant: "destructive",
            });
        },
    });
};

export const useDeleteFlashSale = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => flashSaleService.deleteFlashSale(id),
        onSuccess: (result) => {
            if (result.success) {
                toast({
                    title: "Thành công",
                    description: "Đã xóa chiến dịch Flash Sale thành công!",
                });
                queryClient.invalidateQueries({ queryKey: flashSaleKeys.all });
            } else {
                toast({
                    title: "Lỗi",
                    description: result.error || "Không thể xóa chiến dịch Flash Sale.",
                    variant: "destructive",
                });
            }
        },
        onError: (err: any) => {
            toast({
                title: "Lỗi",
                description: err?.response?.data?.error || err.message || "Có lỗi xảy ra khi xóa chiến dịch.",
                variant: "destructive",
            });
        },
    });
};

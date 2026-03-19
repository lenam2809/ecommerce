"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { orderService } from '@/services/order-service';
import { toast } from '@/hooks/use-toast';
import { EOrderStatus, GetOrderHistoryOverviewParams, GetOrderHistoryParams } from '@/types/order';

// Key factory for efficient cache management
const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params: any) => [...orderKeys.lists(), params] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,

  // History keys
  histories: () => [...orderKeys.all, 'history'] as const,
  history: (orderId: string, params: any) => [...orderKeys.histories(), orderId, params] as const,
  stats: () => [...orderKeys.all, 'stats'] as const,
  overview: (params: any) => [...orderKeys.stats(), 'overview', params] as const,

};

export const useGetOrders = (params: any = {}) => {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => orderService.getAllOrders(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetOrder = (id: string) => {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => orderService.getOrderById(id),
    enabled: !!id, // Only run query when id is available
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, expectedDeliveryDate }: { id: string, status: EOrderStatus, expectedDeliveryDate?: Date }) =>
      orderService.updateOrderStatus(id, status, expectedDeliveryDate),
    onSuccess: (data, variables) => {
      toast({
        title: "Cập nhật trạng thái đơn hàng",
        description: 'Cập nhật trạng thái đơn hàng thành công!',
      })
      // Update cache for both list and detail
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
    onError: (error: any) => {
      toast({
        title: "Cập nhật trạng thái đơn hàng",
        description: error.response?.data?.message ||
          'Có lỗi xảy ra khi cập nhật trạng thái đơn hàng. Vui lòng thử lại sau.',
        variant: "destructive",
      })
    }
  });
};

export const useCreateOrder = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData: any) => orderService.createOrder(orderData),
    onSuccess: () => {
      toast({
        title: "Tạo đơn hàng",
        description: 'Tạo đơn hàng mới thành công!',
      })
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      router.push('/orders');
    },
    onError: (error: any) => {
      toast({
        title: "Tạo đơn hàng",
        description: error.response?.data?.message ||
          'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại sau.',
        variant: "destructive",
      })
    }
  });
};

export const useUpdateOrder = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData: any) =>
      orderService.updateOrder(orderData),
    onSuccess: (data, variables) => {
      toast({
        title: "Cập nhật đơn hàng",
        description: 'Cập nhật đơn hàng thành công!',
      })
      // Update cache for both list and detail
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      router.push('/orders');
    },
    onError: (error: any) => {
      toast({
        title: "Cập nhật đơn hàng",
        description: error.response?.data?.message ||
          'Có lỗi xảy ra khi cập nhật đơn hàng. Vui lòng thử lại sau.',
        variant: "destructive",
      })
    }
  });
};

export const useDeleteOrder = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => orderService.deleteOrder(id),
    onSuccess: () => {
      toast({
        title: "Xóa đơn hàng",
        description: 'Xóa đơn hàng thành công!',
      })
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Xóa đơn hàng",
        description: error.response?.data?.message ||
          'Có lỗi xảy ra khi xóa đơn hàng. Vui lòng thử lại sau.',
        variant: "destructive",
      })
    }
  });
};

export const useGetOrderHistory = (params: GetOrderHistoryParams) => {
  const { orderId, pageNumber = 1, pageSize = 20 } = params;

  return useQuery({
    queryKey: orderKeys.history(orderId, { pageNumber, pageSize }),
    queryFn: () => orderService.getOrderHistory(params),
    enabled: !!orderId,
    staleTime: 1000 * 60 * 2, // 2 minutes - history changes less frequently
  });
};

export const useGetOrderHistoryOverview = (params?: GetOrderHistoryOverviewParams) => {
  return useQuery({
    queryKey: orderKeys.overview(params || {}),
    queryFn: () => orderService.getOrderHistoryOverview(params),
    staleTime: 1000 * 60 * 15, // 15 minutes - admin overview doesn't change frequently
  });
};
"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { orderService } from '@/services/order-service';
import { toast } from '@/hooks/use-toast';
import { EOrderStatus, GetOrderHistoryOverviewParams, GetOrderHistoryParams, EDepositStatus } from '@/types/order';
import { handleApiError } from '@/lib/api-error';

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
      onError: (error: unknown) => {
        handleApiError({
          error,
          context: { operation: 'updateOrderStatus' },
          devTitle: "Lỗi",
          notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
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
    onError: (error: unknown) => {
      handleApiError({
        error,
        context: { operation: 'createOrder' },
        devTitle: "Lỗi",
        notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
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
    onError: (error: unknown) => {
      handleApiError({
        error,
        context: { operation: 'updateOrder' },
        devTitle: "Lỗi",
        notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
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
    onError: (error: unknown) => {
      handleApiError({
        error,
        context: { operation: 'deleteOrder' },
        devTitle: "Lỗi",
        notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
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

export const useAssignItemSerial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      orderItemId,
      serialNumber,
      imei,
      warrantyMonths,
    }: {
      orderId: string;
      orderItemId: string;
      serialNumber: string;
      imei?: string;
      warrantyMonths?: number;
    }) => orderService.assignItemSerial(orderId, orderItemId, { serialNumber, imei, warrantyMonths }),
    onSuccess: (_, variables) => {
      toast({
        title: "Gán Serial/IMEI",
        description: `Đã gán mã Serial ${variables.serialNumber} thành công!`,
      });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.orderId) });
    },
    onError: (error: unknown) => {
      handleApiError({
        error,
        context: { operation: 'assignItemSerial' },
        devTitle: "Lỗi gán Serial/IMEI",
        notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
      });
    },
  });
};

export const useRemoveSerial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, serialId }: { orderId: string; serialId: string }) =>
      orderService.removeSerial(orderId, serialId),
    onSuccess: (_, variables) => {
      toast({
        title: "Gỡ Serial/IMEI",
        description: "Đã gỡ mã Serial/IMEI thành công!",
      });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.orderId) });
    },
    onError: (error: unknown) => {
      handleApiError({
        error,
        context: { operation: 'removeSerial' },
        devTitle: "Lỗi gỡ Serial/IMEI",
        notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
      });
    },
  });
};

export const useActivateWarranty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, orderItemId }: { orderId: string; orderItemId?: string }) =>
      orderService.activateWarranty(orderId, orderItemId),
    onSuccess: (data, variables) => {
      toast({
        title: "Kích hoạt e-Warranty",
        description: "Đã kích hoạt bảo hành điện tử 24T thành công!",
      });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.orderId) });
    },
    onError: (error: unknown) => {
      handleApiError({
        error,
        context: { operation: 'activateWarranty' },
        devTitle: "Lỗi kích hoạt bảo hành",
        notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
      });
    },
  });
};

export const useUploadInvoicePdf = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, formData }: { orderId: string; formData: FormData }) =>
      orderService.uploadInvoicePdf(orderId, formData),
    onSuccess: (_, variables) => {
      toast({
        title: "Hóa đơn VAT",
        description: "Upload file hóa đơn VAT thành công!",
      });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.orderId) });
    },
    onError: (error: unknown) => {
      handleApiError({
        error,
        context: { operation: 'uploadInvoicePdf' },
        devTitle: "Lỗi upload hóa đơn VAT",
        notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
      });
    },
  });
};

export const useUpdateDepositStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      depositStatus,
      depositAmount,
      carrierName,
      trackingNumber,
      driverName,
      driverPhone,
    }: {
      orderId: string;
      depositStatus: EDepositStatus;
      depositAmount?: number;
      carrierName?: string;
      trackingNumber?: string;
      driverName?: string;
      driverPhone?: string;
    }) =>
      orderService.updateDepositStatus(orderId, {
        depositStatus,
        depositAmount,
        carrierName,
        trackingNumber,
        driverName,
        driverPhone,
      }),
    onSuccess: (_, variables) => {
      toast({
        title: "Đặt cọc & Vận đơn",
        description: "Cập nhật trạng thái đặt cọc và vận đơn thành công!",
      });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.orderId) });
    },
    onError: (error: unknown) => {
      handleApiError({
        error,
        context: { operation: 'updateDepositStatus' },
        devTitle: "Lỗi cập nhật cọc/vận đơn",
        notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
      });
    },
  });
};
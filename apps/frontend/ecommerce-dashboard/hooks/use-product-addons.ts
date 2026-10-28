"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { productAddOnService } from '@/services/product-addon-service'
import {
  CreateProductAddOnRequest,
  UpdateProductAddOnRequest,
  ProductAddOnFilters,
} from '@/types/product-addon'
import { toast } from './use-toast'

export const productAddOnKeys = {
  all: ['product-addons'] as const,
  lists: () => [...productAddOnKeys.all, 'list'] as const,
  list: (filters?: ProductAddOnFilters) => [...productAddOnKeys.lists(), filters] as const,
  details: () => [...productAddOnKeys.all, 'detail'] as const,
  detail: (id: string) => [...productAddOnKeys.details(), id] as const,
}

export const useGetProductAddOns = (filters?: ProductAddOnFilters) => {
  return useQuery({
    queryKey: productAddOnKeys.list(filters),
    queryFn: () => productAddOnService.getAllProductAddOns(filters),
    staleTime: 1000 * 60 * 3,
  })
}

export const useGetProductAddOn = (id: string) => {
  return useQuery({
    queryKey: productAddOnKeys.detail(id),
    queryFn: () => productAddOnService.getProductAddOnById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}

export const useCreateProductAddOn = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProductAddOnRequest) =>
      productAddOnService.createProductAddOn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productAddOnKeys.all })
      toast({
        title: 'Thành công',
        description: 'Tạo gói dịch vụ mới thành công.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi',
        description: error?.response?.data?.message || 'Không thể tạo gói dịch vụ.',
        variant: 'destructive',
      })
    },
  })
}

export const useUpdateProductAddOn = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductAddOnRequest }) =>
      productAddOnService.updateProductAddOn(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productAddOnKeys.all })
      toast({
        title: 'Thành công',
        description: 'Cập nhật gói dịch vụ thành công.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi',
        description: error?.response?.data?.message || 'Không thể cập nhật gói dịch vụ.',
        variant: 'destructive',
      })
    },
  })
}

export const useDeleteProductAddOn = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => productAddOnService.deleteProductAddOn(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productAddOnKeys.all })
      toast({
        title: 'Thành công',
        description: 'Đã xóa gói dịch vụ.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi',
        description: error?.response?.data?.message || 'Không thể xóa gói dịch vụ.',
        variant: 'destructive',
      })
    },
  })
}

"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { productService } from '@/services/product-service';
import { CreateProductDto, UpdateProductDto } from '@/schemas/product';
import { toast } from './use-toast';
import { OptionType } from '@/components/ui/select/single-select';

// Key factory cho quản lý cache hiệu quả
const productKeys = {
  all: ['products'] as const,
  options: ['products/options'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: any) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  byCategory: (id: string) => [...productKeys.all, 'byCategory', id] as const,
  byBrand: (id: string) => [...productKeys.all, 'byBrand', id] as const,
};

export const useGetProducts = (params: any = {}) => {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productService.getAllProducts(params),
    staleTime: 1000 * 60 * 5, // 5 phút
  });
};

export const useGetProduct = (id: string) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.getProductById(id),
    enabled: !!id, // Chỉ chạy query khi có id
    staleTime: 1000 * 60 * 5, // 5 phút
  });
};

export const useGetOptionProducts = () => {
  return useQuery({
    queryKey: productKeys.options,
    queryFn: () => productService.getOptions<OptionType>(),
    staleTime: 1000 * 60 * 5, // 5 phút
  });
};

export const useGetProductsByCategory = (categoryId: string) => {
  return useQuery({
    queryKey: productKeys.byCategory(categoryId),
    queryFn: () => productService.getProductsByCategoryId(categoryId),
    enabled: !!categoryId, // Chỉ chạy query khi có categoryId
    staleTime: 1000 * 60 * 5, // 5 phút
  });
};

export const useGetProductsByBrand = (brandId: string) => {
  return useQuery({
    queryKey: productKeys.byBrand(brandId),
    queryFn: () => productService.getProductsByBrandId(brandId),
    enabled: !!brandId, // Chỉ chạy query khi có brandId
    staleTime: 1000 * 60 * 5, // 5 phút
  });
};

export const useCreateProduct = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productData: CreateProductDto) => productService.createProduct(productData),
    onSuccess: () => {
      toast({
        title: "Thêm mới sản phẩm",
        description: 'Thêm mới sản phẩm thành công!',
      })
      // Invalidate và refetch
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      router.push('/products');
    },
    onError: (error: any) => {
      toast({
        title: "Thêm mới sản phẩm",
        description: error.response?.data?.message ||
          'Có lỗi xảy ra khi thêm sản phẩm. Vui lòng thử lại sau.',
        variant: "destructive",
      })
    }
  });
};

export const useUpdateProduct = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productData: UpdateProductDto) => productService.updateProduct(productData),
    onSuccess: (data, variables) => {
      toast({
        title: "Cập nhật sản phẩm",
        description: 'Cập nhật sản phẩm thành công!',
      })
      // Cập nhật cache cho cả danh sách và chi tiết sản phẩm
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      router.push('/products');
    },
    onError: (error: any) => {
      toast({
        title: "cập nhật sản phẩm",
        description: error.response?.data?.message ||
          'Có lỗi xảy ra khi cập nhật sản phẩm. Vui lòng thử lại sau.',
        variant: "destructive",
      })
    }
  });
};

export const useDeleteProduct = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: (_, variables) => {
      toast({
        title: "Xóa sản phẩm",
        description: 'Xóa sản phẩm thành công!',
      })
      // Invalidate và refetch
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Xóa sản phẩm",
        description: error.response?.data?.message ||
          'Có lỗi xảy ra khi xóa sản phẩm. Vui lòng thử lại sau.',
        variant: "destructive",
      })
    }
  });
};
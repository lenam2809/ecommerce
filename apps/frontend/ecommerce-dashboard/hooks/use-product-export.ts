// hooks/use-product-export.ts
import { useMutation, useQuery } from '@tanstack/react-query';
import { productImportExportService } from '@/services/product-import-export-service';
import { toast } from './use-toast';
import { useState } from 'react';
import api from '@/lib/axios';

interface Product {
    id: string;
    name: string;
    code: string;
    sku: string;
    isActive: boolean;
}

export const useProductExport = () => {
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

    const { data: products, isLoading: isLoadingProducts } = useQuery({
        queryKey: ['products-for-export'],
        queryFn: async () => {
            const response = await api.get<{ isSuccess: boolean; value: Product[] }>('/products');
            return response.data.isSuccess ? response.data.value : [];
        },
    });

    const exportMutation = useMutation({
        mutationFn: async (params: {
            format: string;
            includeInactive: boolean;
            productIds?: string[];
        }) => {
            return productImportExportService.exportProducts(params);
        },
        onSuccess: (data, variables) => {
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute(
                'download',
                `Danh_sach_san_pham_${new Date().toISOString().split('T')[0]}.${variables.format}`
            );
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast({
                title: 'Xuất dữ liệu thành công',
                description: 'Dữ liệu sản phẩm đã được xuất thành công',
            });
        },
        onError: () => {
            toast({
                title: 'Xuất dữ liệu thất bại',
                description: 'Không thể xuất dữ liệu sản phẩm',
                variant: 'destructive',
            });
        },
    });

    const toggleProductSelection = (productId: string) => {
        setSelectedProductIds(prev =>
            prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
        );
    };

    return {
        products,
        isLoadingProducts,
        exportMutation,
        selectedProductIds,
        toggleProductSelection,
    };
};
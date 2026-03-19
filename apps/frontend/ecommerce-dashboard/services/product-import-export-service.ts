// services/product-import-export-service.ts
import { Result } from '@/types';
import { BaseService } from './base-service';
import api from '@/lib/axios';

export class ProductImportExportService extends BaseService {
    constructor() {
        super('/products');
    }

    async exportProducts(params: {
        format: string;
        includeInactive: boolean;
        productIds?: string[];
    }): Promise<Blob> {
        const searchParams = new URLSearchParams();
        searchParams.append('format', params.format);
        searchParams.append('includeInactive', params.includeInactive.toString());

        if (params.productIds && params.productIds.length > 0) {
            params.productIds.forEach(id => searchParams.append('productIds', id));
        }

        const response = await api.get(`/products/export?${searchParams.toString()}`, {
            responseType: 'blob',
        });
        return response.data;
    }

    async importProducts(file: File, validateOnly: boolean): Promise<Result<any>> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('validateOnly', validateOnly.toString());

        const response = await api.post(
            `/products/${validateOnly ? 'validate-import' : 'import'}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    }

    async downloadTemplate(format: string): Promise<Blob> {
        const response = await api.get(`/products/export-template?format=${format}`, {
            responseType: 'blob',
        });
        return response.data;
    }
}

export const productImportExportService = new ProductImportExportService();